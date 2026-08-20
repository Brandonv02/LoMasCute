/**
 * Contrato del checkout.
 *
 * Vive aquí y no en el servicio porque los dos lados necesitan las mismas
 * reglas: el formulario para avisar mientras se escribe, y la Server Action
 * para no creerse lo que llega. Mismo planteamiento que `src/lib/contact.ts`.
 *
 * Lo que **no** está aquí, deliberadamente: ni un precio, ni el envío, ni el
 * total. El carrito vive en localStorage y guarda el precio que tenía el
 * producto el día que se agregó, así que lo que el navegador cree que cuesta
 * algo no es una fuente de verdad — y cualquiera puede editarlo antes de
 * enviar. El servidor recalcula todo leyendo `products` y `site_settings`.
 */

import { z } from "zod";
import type { PaymentMethod } from "@/lib/supabase/types";
import { normalize } from "@/lib/utils";

export const CHECKOUT_LIMITS = {
  name: 70,
  email: 160,
  phone: 40,
  address: 200,
  neighborhood: 80,
  notes: 400,
} as const;

/** Cuando el panel no tiene medios de pago configurados, el pedido se coordina después. */
export const PAYMENT_TO_ARRANGE = "Por coordinar";

/* ------------------------------------------------------------------ líneas */

/**
 * Una línea del pedido, tal como viaja.
 *
 * Solo identidad y cantidad. El nombre, el precio y el tono válido los pone el
 * servidor desde el catálogo.
 */
export const checkoutItemSchema = z.object({
  productId: z.string().uuid("Tu bolsa tiene un producto que no reconocemos"),
  quantity: z
    .number()
    .int("Las cantidades tienen que ser números enteros")
    .min(1, "Cada producto necesita al menos 1 unidad")
    .max(99, "Máximo 99 unidades por producto"),
  shade: z.string().trim().max(80).optional(),
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;

/* ----------------------------------------------------------------- datos */

export const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Escribe tu nombre completo")
    .max(CHECKOUT_LIMITS.name, "Ese nombre es muy largo"),

  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio: ahí te enviamos la confirmación")
    .email("Revisa el correo, parece que le falta algo")
    .max(CHECKOUT_LIMITS.email, "Ese correo es demasiado largo"),

  phone: z
    .string()
    .trim()
    .min(7, "Escribe tu celular para coordinar la entrega")
    .max(CHECKOUT_LIMITS.phone, "Ese número es demasiado largo")
    .regex(/^[0-9+()\s-]+$/, "El celular solo puede tener números"),

  address: z
    .string()
    .trim()
    .min(6, "Escribe la dirección completa con número")
    .max(CHECKOUT_LIMITS.address, "Esa dirección es demasiado larga"),

  neighborhood: z
    .string()
    .trim()
    .min(1, "Selecciona tu barrio")
    .max(CHECKOUT_LIMITS.neighborhood, "Ese barrio es demasiado largo"),

  /**
   * Etiqueta del medio de pago, tal como la ofrece la tienda.
   *
   * Aquí solo se comprueba que venga algo: **qué** valores son válidos depende
   * de lo que el panel tenga guardado en `site_settings`, y eso solo lo sabe el
   * servidor. La comprobación de verdad está en `src/services/orders.ts`.
   */
  payment: z.string().trim().min(1, "Elige un método de pago"),

  notes: z
    .string()
    .trim()
    .max(CHECKOUT_LIMITS.notes, "Máximo 400 caracteres")
    .optional(),

  isGift: z.boolean().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Lo que de verdad viaja del formulario a la Server Action: los datos, las
 * líneas y la llave contra el doble envío.
 *
 * La llave la genera el navegador una vez por intento de compra. Si el mismo
 * pedido llega dos veces —doble clic, reintento tras un corte de red— la base
 * devuelve el pedido que ya existe en vez de crear otro (ver
 * `0012_customer_orders.sql`).
 */
export const checkoutSubmissionSchema = checkoutSchema.extend({
  items: z
    .array(checkoutItemSchema)
    .min(1, "Tu bolsa está vacía")
    .max(50, "Son demasiados productos para un solo pedido"),
  idempotencyKey: z.string().uuid(),
});

export type CheckoutSubmission = z.infer<typeof checkoutSubmissionSchema>;

/**
 * Llave nueva para un intento de compra.
 *
 * `crypto.randomUUID()` solo existe en contexto seguro: en https y en
 * localhost sí, pero al abrir el sitio por http desde otro equipo de la red
 * —algo que se hace todo el tiempo para probar en el celular— es `undefined` y
 * el checkout reventaría con un TypeError. `getRandomValues` sí está siempre,
 * así que de ahí sale el respaldo, con los bits de versión y variante puestos a
 * mano para que siga siendo un uuid v4 válido.
 */
export function newAttemptKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versión 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

/* ------------------------------------------------------- medio de pago */

/**
 * A qué casilla del enum va una etiqueta libre.
 *
 * La tienda escribe sus medios de pago como texto («Nequi», «Bancolombia
 * ahorros», «Addi»), pero la columna `payment_method` es un enum cerrado que se
 * usa para agrupar. Esto traduce lo uno en lo otro por palabra clave, y lo que
 * no reconoce cae en `otro`.
 *
 * La etiqueta original **no se pierde**: se guarda aparte en `payment_label`,
 * que es lo que se le muestra a quien atiende. Esta función solo elige la
 * casilla del informe.
 */
export function paymentBucket(label: string): PaymentMethod {
  // `normalize` quita acentos y baja a minúsculas: «Consignación» y
  // «consignacion» tienen que caer en la misma casilla.
  const text = normalize(label);

  if (text.includes("efectivo") || text.includes("contra entrega")) return "efectivo";
  if (text.includes("nequi")) return "nequi";
  if (text.includes("bancolombia")) return "bancolombia";
  if (text.includes("transferencia") || text.includes("consignacion")) {
    return "transferencia";
  }
  return "otro";
}
