"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus, PaymentMethod } from "@/lib/supabase/types";
import { messageFor } from "@/services/errors";
import {
  createManualOrder,
  deleteOrder,
  setOrderStatus,
  type OrderInput,
} from "@/services/orders";

/**
 * Server Actions del módulo Pedidos.
 *
 * Leen el FormData, lo convierten en un `OrderInput` tipado y traducen
 * cualquier fallo a un mensaje presentable. El movimiento de stock vive en la
 * base (ver 0006_orders.sql), no aquí.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

const SECTION = "/admin/pedidos";

/** Una venta cambia el inventario: hay que refrescar también lo que lo muestra. */
function refresh() {
  revalidatePath(SECTION);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
}

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

/**
 * Las líneas viajan como campos repetidos: `productId` y `quantity` en el mismo
 * orden. Una fila sin producto elegido se descarta — es una fila en blanco que
 * quien vende dejó abierta, no un error.
 */
function parseItems(formData: FormData): OrderInput["items"] {
  const ids = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map(String);

  return ids
    .map((productId, index) => ({
      productId: productId.trim(),
      quantity: Number(quantities[index] ?? 1),
    }))
    .filter((item) => item.productId);
}

function parseInput(formData: FormData): OrderInput {
  return {
    customerName: field(formData, "customerName"),
    customerWhatsapp: field(formData, "customerWhatsapp"),
    customerCity: field(formData, "customerCity"),
    paymentMethod: (field(formData, "paymentMethod") || "efectivo") as PaymentMethod,
    status: (field(formData, "status") || "pendiente") as OrderStatus,
    notes: field(formData, "notes"),
    items: parseItems(formData),
  };
}

/* ------------------------------------------------------------ crear venta */

export async function createOrderAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let id: string;
  try {
    id = await createManualOrder(parseInput(formData));
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }

  // Fuera del try: `redirect` funciona lanzando, y atraparlo lo rompería.
  refresh();
  redirect(`${SECTION}/${id}?creada=1`);
}

/* --------------------------------------------------------- cambiar estado */

export async function setOrderStatusAction(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  try {
    await setOrderStatus(id, status);
    refresh();
    revalidatePath(`${SECTION}/${id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/* -------------------------------------------------------- eliminar venta */

/** Al eliminar, la base devuelve el stock de cada línea al catálogo. */
export async function deleteOrderAction(id: string): Promise<ActionResult> {
  try {
    await deleteOrder(id);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}
