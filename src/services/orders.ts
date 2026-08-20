import "server-only";

import { adminClient } from "@/lib/supabase/client";
import type {
  Json,
  OrderChannel,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  PaymentMethod,
} from "@/lib/supabase/types";
import {
  PAYMENT_TO_ARRANGE,
  checkoutSubmissionSchema,
  paymentBucket,
  type CheckoutSubmission,
} from "@/lib/checkout";
import { getSiteSettings } from "@/services/site-settings";
import { ServiceError, toServiceError } from "@/services/errors";

/**
 * Servicio de ventas: la única puerta a `orders` y `order_items`.
 *
 * Usa `service_role` siempre. Estas tablas llevan nombre y teléfono de quien
 * compró, así que no tienen lectura pública: RLS está activo y sin políticas,
 * y solo se llega desde el servidor.
 *
 * Nada de lo que mueve stock se hace con consultas sueltas. Crear y eliminar
 * llaman a las funciones de `0006_orders.sql` y `0012_customer_orders.sql`; un
 * pedido toca tres tablas, y si el descuento de inventario fuera un `update`
 * aparte, un fallo a mitad dejaría el stock mintiendo. Dentro de la función, o
 * pasa todo o no pasa nada.
 *
 * Cambiar el estado es la excepción aparente: `setOrderStatus` es un `update` de
 * una sola columna y el inventario se ajusta solo, en la misma transacción, por
 * el disparador `orders_sync_stock`. La regla de quién retiene stock vive en la
 * base (`order_status_retains_stock`) y no aquí, para que no haya dos versiones
 * de la verdad: `pagado` y `entregado` retienen, `pendiente` y `cancelado` no.
 */

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  /** Tono pedido. Solo viene en pedidos web: la venta manual no lo pregunta. */
  shade: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  code: string;
  /** `online` lo hizo un cliente en la tienda; `manual` lo registro el panel. */
  channel: OrderChannel;
  customerName: string | null;
  customerEmail: string | null;
  customerWhatsapp: string | null;
  customerCity: string | null;
  shippingAddress: string | null;
  shippingNeighborhood: string | null;
  shippingCost: number;
  paymentMethod: PaymentMethod;
  /** Etiqueta que eligio el cliente. Solo en pedidos web. */
  paymentLabel: string | null;
  status: OrderStatus;
  notes: string | null;
  isGift: boolean;
  /**
   * ¿Este pedido está reteniendo inventario ahora mismo?
   *
   * Es la lectura en positivo de `stock_returned`, que la base mantiene sola
   * (ver 0012_customer_orders.sql). No se deduce del estado a propósito: los
   * pedidos anteriores a esa migración pueden estar en `pendiente` y aun así
   * tener el stock descontado, y lo que hay que mostrar es la realidad.
   */
  stockHeld: boolean;
  /** Suma de las lineas, sin domicilio. Derivado de total menos shippingCost. */
  itemsTotal: number;
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
  channel?: OrderChannel | "all";
};

export type OrderStats = {
  total: number;
  byStatus: Record<OrderStatus, number>;
  byChannel: Record<OrderChannel, number>;
  /**
   * Pedidos web sin confirmar: es la cifra que hay que atender.
   *
   * Un pedido web en `pendiente` no retiene inventario y nadie ha pagado nada
   * todavía, así que mientras no se confirme no es una venta.
   */
  pendingOnline: number;
  /**
   * Facturado: solo lo que de verdad se vendió.
   *
   * Antes era «todo lo que no esté cancelado», y con los pedidos web eso
   * empezaría a mentir: un pedido recién llegado está en `pendiente` y nadie ha
   * pagado nada. Se cuenta lo que retiene inventario —pagado y entregado—, que
   * es la misma frontera que usa el stock.
   */
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
    shade: row.shade,
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
    channel: row.channel,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerWhatsapp: row.customer_whatsapp,
    customerCity: row.customer_city,
    shippingAddress: row.shipping_address,
    shippingNeighborhood: row.shipping_neighborhood,
    shippingCost: row.shipping_cost,
    paymentMethod: row.payment_method,
    paymentLabel: row.payment_label,
    status: row.status,
    notes: row.notes,
    isGift: row.is_gift,
    stockHeld: !row.stock_returned,
    itemsTotal: row.total - row.shipping_cost,
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

  if (filters.channel && filters.channel !== "all") {
    query = query.eq("channel", filters.channel);
  }

  const search = filters.search?.trim();
  if (search) {
    // Busca por cliente y también por código: es lo que se tiene a mano
    // cuando alguien escribe "¿en qué va mi pedido?".
    const term = `%${search.replace(/[%,]/g, "")}%`;
    query = query.or(
      `customer_name.ilike.${term},customer_email.ilike.${term},customer_whatsapp.ilike.${term},customer_city.ilike.${term},shipping_address.ilike.${term},code.ilike.${term}`,
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
  const { data, error } = await adminClient()
    .from("orders")
    .select("status, total, channel");

  if (error) throw toServiceError(error);

  const rows = data ?? [];
  const byStatus: Record<OrderStatus, number> = {
    pendiente: 0,
    pagado: 0,
    entregado: 0,
    cancelado: 0,
  };
  const byChannel: Record<OrderChannel, number> = { online: 0, manual: 0 };

  for (const row of rows) {
    byStatus[row.status] += 1;
    byChannel[row.channel] += 1;
  }

  return {
    total: rows.length,
    byStatus,
    byChannel,
    pendingOnline: rows.filter(
      (row) => row.channel === "online" && row.status === "pendiente",
    ).length,
    revenue: rows
      .filter((row) => row.status === "pagado" || row.status === "entregado")
      .reduce((sum, row) => sum + row.total, 0),
  };
}

/**
 * Pedidos web sin confirmar, para la pastilla del menú del panel.
 *
 * Nunca lanza: se llama desde el layout, y un contador que tumbe todas las
 * pantallas del panel —incluida la que explica qué credencial falta— sería
 * mucho peor que un contador que no se pinta.
 */
export async function countPendingOnlineOrders(): Promise<number> {
  try {
    const { count, error } = await adminClient()
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("channel", "online")
      .eq("status", "pendiente");

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
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

/* ----------------------------------------------------- pedido de la tienda */

/** Lo que necesita la pantalla de confirmación: el código y el total reales. */
export type PlacedOrder = {
  id: string;
  code: string;
  itemsTotal: number;
  shippingCost: number;
  total: number;
};

export type PlacementResult = {
  /** Lo que viaja al navegador. */
  summary: PlacedOrder;
  /** El pedido completo, con su detalle: es lo que necesitan los avisos. */
  order: Order;
  /**
   * `false` si este intento ya había entrado antes.
   *
   * Solo sirve para no avisar dos veces del mismo pedido cuando alguien
   * reintenta con la misma llave. El pedido duplicado ya lo impide la base.
   */
  created: boolean;
};

/**
 * Registra un pedido hecho desde la tienda.
 *
 * No mueve inventario: el pedido nace en `pendiente`, que no retiene stock (ver
 * 0012_customer_orders.sql). El inventario baja cuando alguien lo confirma
 * desde el panel.
 *
 * Todo lo que tiene que ver con dinero lo calcula la base: el precio sale del
 * catálogo y el domicilio de `site_settings`. Aquí solo viajan identidades y
 * cantidades — el carrito vive en localStorage y su precio puede ser de hace
 * tres semanas, además de ser editable por cualquiera antes de enviar.
 *
 * Los `ServiceError` que salen de aquí están escritos para que los lea alguien
 * que está comprando, no un administrador.
 */
export async function createCustomerOrder(
  input: CheckoutSubmission,
): Promise<PlacementResult> {
  const parsed = checkoutSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(
      parsed.error.issues[0]?.message ?? "Revisa los datos del pedido.",
    );
  }

  const data = parsed.data;
  const settings = await getSiteSettings();

  /**
   * El medio de pago y el barrio se comprueban contra lo que la tienda ofrece.
   *
   * El esquema no puede hacerlo: las dos listas viven en `site_settings` y
   * cambian desde el panel. Sin esta comprobación, quien llame a la Server
   * Action por fuera del formulario mete el texto que quiera en la ficha del
   * pedido.
   */
  const allowedPayments = settings.paymentMethods.length
    ? settings.paymentMethods
    : [PAYMENT_TO_ARRANGE];

  if (!allowedPayments.includes(data.payment)) {
    throw new ServiceError("Ese método de pago ya no está disponible. Elige otro.");
  }

  // Sin barrios configurados el campo es libre: no hay lista contra la que medir.
  if (
    settings.shippingNeighborhoods.length > 0 &&
    !settings.shippingNeighborhoods.includes(data.neighborhood)
  ) {
    throw new ServiceError(
      "Todavía no llegamos a ese barrio. Elige uno de la lista para continuar.",
    );
  }

  /**
   * Dos líneas del mismo producto **y el mismo tono** se suman.
   *
   * El tono entra en la llave a propósito: un labial en «Coral» y el mismo en
   * «Nude» son dos cosas distintas que hay que empacar por separado, aunque
   * compartan `product_id`.
   */
  const merged = new Map<
    string,
    { productId: string; quantity: number; shade?: string }
  >();

  for (const item of data.items) {
    const key = `${item.productId}::${item.shade ?? ""}`;
    const current = merged.get(key);
    if (current) current.quantity += item.quantity;
    else merged.set(key, { ...item });
  }

  const payload = {
    idempotency_key: data.idempotencyKey,
    customer_name: data.name,
    customer_email: data.email,
    customer_whatsapp: data.phone,
    // La ciudad no la escribe el cliente: la tienda solo cubre la suya, y el
    // checkout la muestra como campo de solo lectura.
    customer_city: settings.storeCity,
    shipping_address: data.address,
    shipping_neighborhood: data.neighborhood,
    payment_method: paymentBucket(data.payment),
    payment_label: data.payment,
    notes: data.notes ?? "",
    is_gift: data.isGift ?? false,
    items: [...merged.values()].map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      shade: item.shade ?? "",
    })),
  };

  /**
   * ¿Este intento ya había entrado?
   *
   * La base ya impide el pedido duplicado —`idempotency_key` es único y la
   * función devuelve el que existe—, pero desde aquí las dos respuestas se ven
   * igual: un uuid. Y hay algo que sí depende de la diferencia: avisar. Sin
   * esta consulta, un reintento tras un error de red mandaría un segundo correo
   * por el mismo pedido, y «¿me entraron dos ventas o una?» es justo la duda
   * que vuelve inútil un sistema de avisos.
   *
   * Es una consulta por índice y va antes del `rpc`, así que queda una ventana
   * mínima: dos envíos exactamente simultáneos podrían verse los dos como
   * nuevos. El peor caso es un correo repetido, nunca un pedido repetido.
   */
  const { data: existing } = await adminClient()
    .from("orders")
    .select("id")
    .eq("idempotency_key", data.idempotencyKey)
    .maybeSingle();

  const { data: id, error } = await adminClient().rpc("create_customer_order", {
    payload: payload as unknown as Json,
  });

  if (error) {
    /**
     * `P0001` es el código de un `raise exception` de plpgsql: son los mensajes
     * que escribimos nosotros en la función y ya están redactados para leerse
     * en la tienda («Se nos acabó "Labial Cloud Kiss"»).
     *
     * Cualquier otro código es un fallo de infraestructura —una migración sin
     * aplicar, una columna que no existe— y ese detalle no se le cuenta a un
     * visitante: va al log, que es donde alguien puede hacer algo con él.
     */
    if (error.code === "P0001") throw new ServiceError(error.message);

    console.error("[checkout] no se pudo crear el pedido:", error);
    throw new ServiceError(
      "No pudimos registrar tu pedido. Vuelve a intentarlo en un momento.",
    );
  }

  const order = await getOrder(id as string);

  if (!order) {
    // El pedido existe (la función lo devolvió) pero no se pudo leer de vuelta.
    // No se puede confirmar un código que no tenemos.
    console.error("[checkout] pedido creado pero no legible:", id);
    throw new ServiceError(
      "Tu pedido se guardó, pero no pudimos mostrarte el resumen. Escríbenos por WhatsApp y lo confirmamos.",
    );
  }

  return {
    summary: {
      id: order.id,
      code: order.code,
      itemsTotal: order.itemsTotal,
      shippingCost: order.shippingCost,
      total: order.total,
    },
    order,
    created: !existing,
  };
}
