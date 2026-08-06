import "server-only";

import { adminClient } from "@/lib/supabase/client";
import type {
  Json,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  PaymentMethod,
} from "@/lib/supabase/types";
import { ServiceError, toServiceError } from "@/services/errors";

/**
 * Servicio de ventas: la única puerta a `orders` y `order_items`.
 *
 * Usa `service_role` siempre. Estas tablas llevan nombre y teléfono de quien
 * compró, así que no tienen lectura pública: RLS está activo y sin políticas,
 * y solo se llega desde el servidor.
 *
 * Lo que mueve stock —crear y eliminar— no se hace con consultas sueltas sino
 * llamando a las funciones de `0006_orders.sql`. Una venta toca tres tablas; si
 * el descuento de inventario fuera un `update` aparte, un fallo a mitad dejaría
 * el stock mintiendo. Dentro de la función, o pasa todo o no pasa nada.
 */

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  code: string;
  customerName: string | null;
  customerWhatsapp: string | null;
  customerCity: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes: string | null;
  total: number;
  /** Número de unidades vendidas, sumando todas las líneas */
  units: number;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderFilters = {
  search?: string;
  status?: OrderStatus | "all";
};

export type OrderStats = {
  total: number;
  byStatus: Record<OrderStatus, number>;
  /** Facturado: suma de las ventas que no están canceladas */
  revenue: number;
};

/** Lo que necesita una venta para existir. El cliente es opcional entero. */
export type OrderInput = {
  customerName: string;
  customerWhatsapp: string;
  customerCity: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes: string;
  items: { productId: string; quantity: number }[];
};

type OrderRowWithItems = OrderRow & { order_items: OrderItemRow[] | null };

const SELECT = "*, order_items(*)";

function toItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    subtotal: row.subtotal,
  };
}

function toOrder(row: OrderRowWithItems): Order {
  const items = (row.order_items ?? []).map(toItem);

  return {
    id: row.id,
    code: row.code,
    customerName: row.customer_name,
    customerWhatsapp: row.customer_whatsapp,
    customerCity: row.customer_city,
    paymentMethod: row.payment_method,
    status: row.status,
    notes: row.notes,
    total: row.total,
    units: items.reduce((sum, item) => sum + item.quantity, 0),
    itemCount: items.length,
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ------------------------------------------------------------------ lectura */

export async function listOrders(filters: OrderFilters = {}): Promise<Order[]> {
  let query = adminClient()
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const search = filters.search?.trim();
  if (search) {
    // Busca por cliente y también por código: es lo que se tiene a mano
    // cuando alguien escribe "¿en qué va mi pedido?".
    const term = `%${search.replace(/[%,]/g, "")}%`;
    query = query.or(
      `customer_name.ilike.${term},customer_whatsapp.ilike.${term},customer_city.ilike.${term},code.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) throw toServiceError(error);

  return ((data as OrderRowWithItems[] | null) ?? []).map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await adminClient()
    .from("orders")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw toServiceError(error);
  return data ? toOrder(data as OrderRowWithItems) : null;
}

export async function getOrderStats(): Promise<OrderStats> {
  const { data, error } = await adminClient().from("orders").select("status, total");

  if (error) throw toServiceError(error);

  const rows = data ?? [];
  const byStatus: Record<OrderStatus, number> = {
    pendiente: 0,
    pagado: 0,
    entregado: 0,
    cancelado: 0,
  };

  for (const row of rows) byStatus[row.status] += 1;

  return {
    total: rows.length,
    byStatus,
    revenue: rows
      .filter((row) => row.status !== "cancelado")
      .reduce((sum, row) => sum + row.total, 0),
  };
}

/* ---------------------------------------------------------------- escritura */

/**
 * Registra una venta y descuenta el stock.
 *
 * Se valida aquí además de en el formulario porque una Server Action es un
 * endpoint HTTP: cualquiera puede llamarla sin pasar por la interfaz. Lo que sí
 * queda del lado de la base es el stock, que es donde puede haber carrera.
 */
export async function createManualOrder(input: OrderInput): Promise<string> {
  const items = input.items.filter((item) => item.productId);

  if (!items.length) {
    throw new ServiceError("Agrega al menos un producto a la venta.");
  }
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new ServiceError("Cada producto necesita una cantidad de 1 o más.");
  }

  // Dos líneas del mismo producto se suman: así el bloqueo de stock es uno
  // solo y el detalle no repite la misma referencia dos veces.
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }

  const payload = {
    customer_name: input.customerName,
    customer_whatsapp: input.customerWhatsapp,
    customer_city: input.customerCity,
    payment_method: input.paymentMethod,
    status: input.status,
    notes: input.notes,
    items: [...merged].map(([product_id, quantity]) => ({ product_id, quantity })),
  };

  const { data, error } = await adminClient().rpc("create_manual_order", {
    payload: payload as unknown as Json,
  });

  if (error) {
    // Los `raise exception` de la función llegan aquí como mensaje: ya están
    // escritos para leerse en pantalla ("No hay stock suficiente de …").
    throw new ServiceError(error.message);
  }

  return data as string;
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await adminClient().from("orders").update({ status }).eq("id", id);
  if (error) throw toServiceError(error);
}

/** Elimina la venta y devuelve al catálogo el stock que había descontado. */
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await adminClient().rpc("delete_order", { p_order_id: id });
  if (error) throw new ServiceError(error.message);
}
