"use server";

import { after } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkoutSubmissionSchema } from "@/lib/checkout";
import { createCustomerOrder, type PlacedOrder } from "@/services/orders";
import { notifyNewOrder } from "@/services/notifications";
import { ServiceError } from "@/services/errors";

/**
 * Envío del checkout.
 *
 * Es el único camino por el que la tienda crea un pedido: `orders` está cerrada
 * a la clave pública (0006_orders.sql), así que desde el navegador no se puede
 * insertar nada. Tiene que pasar por aquí, donde el servidor recalcula precios
 * y domicilio en vez de creerse los del carrito.
 *
 * Nunca lanza. Un checkout que revienta con una pantalla de error pierde una
 * venta y el carrito de quien la estaba haciendo.
 */

export type CheckoutResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; message: string };

const GENERIC_FAILURE =
  "No pudimos registrar tu pedido. Vuelve a intentarlo en un momento o " +
  "escríbenos por WhatsApp y lo tomamos por ahí.";

export async function placeOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del pedido.",
    };
  }

  if (!isSupabaseConfigured()) {
    console.error(
      "[checkout] pedido descartado: Supabase no está configurado en este entorno.",
    );
    return { ok: false, message: GENERIC_FAILURE };
  }

  try {
    const { summary, order, created } = await createCustomerOrder(parsed.data);

    /**
     * El aviso a la tienda va **después** de responder.
     *
     * `after()` corre cuando la respuesta ya salió, así que quien compró no
     * espera a que Resend conteste para ver su número de pedido. Y como el
     * pedido ya está guardado, un fallo del correo no puede hacer nada peor que
     * quedarse anotado en el log: por eso `notifyNewOrder` no lanza.
     *
     * Solo si el pedido es nuevo. Un reintento con la misma llave devuelve el
     * pedido que ya existía, y avisar otra vez del mismo sería peor que no
     * avisar.
     */
    if (created) {
      after(() => notifyNewOrder(order));
    }

    return { ok: true, order: summary };
  } catch (error) {
    /**
     * Solo los `ServiceError` llegan a la pantalla: el servicio y la función de
     * la base los escriben pensando en quien está comprando («Solo quedan 2
     * unidades de …»), y son justo lo que hay que leer para poder arreglar el
     * pedido. Todo lo demás va al log.
     */
    if (error instanceof ServiceError) {
      return { ok: false, message: error.message };
    }

    console.error("[checkout] fallo inesperado al crear el pedido:", error);
    return { ok: false, message: GENERIC_FAILURE };
  }
}
