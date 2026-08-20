/**
 * Contrato del formulario de contacto.
 *
 * Vive aquí y no en `src/services/contact.ts` porque el servicio es
 * `server-only` y los dos lados necesitan las mismas reglas: el formulario
 * (cliente) para avisar mientras se escribe, y la Server Action (servidor)
 * para no creerse lo que llega. Un solo esquema, dos usos.
 *
 * Los topes coinciden con los `check` de `0011_contact_messages.sql`. Si
 * cambian aquí hay que cambiarlos allí: la base es la última palabra, y que
 * ella rechace algo que el formulario aceptó se vería como un error del sitio.
 */

import { z } from "zod";

/** Mismos límites que las restricciones de la tabla. */
export const CONTACT_LIMITS = {
  name: 80,
  email: 160,
  phone: 40,
  topic: 80,
  message: 1000,
} as const;

/**
 * Temas del formulario.
 *
 * Es una lista cerrada aunque la columna sea texto libre: la base no quiere
 * una migración por cada tema nuevo, pero el servidor sí tiene que rechazar
 * cualquier cosa que no esté aquí. Sin esa comprobación, la Server Action
 * acepta el texto que le manden y la bandeja del panel se llena de basura.
 */
export const CONTACT_TOPICS = [
  "Una pregunta sobre un producto",
  "El estado de mi pedido",
  "Cambios o devoluciones",
  "Pedidos al por mayor",
  "Colaboraciones y prensa",
  "Otra cosita",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/* ------------------------------------------------------------------ esquema */

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "¿Cómo te llamas?")
    .max(CONTACT_LIMITS.name, `Máximo ${CONTACT_LIMITS.name} caracteres`),

  email: z
    .string()
    .trim()
    .min(1, "Necesitamos tu correo para responderte")
    .email("Revisa el correo")
    .max(CONTACT_LIMITS.email, "Ese correo es demasiado largo"),

  /**
   * Opcional de verdad: la cadena vacía es válida y se guarda como NULL.
   *
   * El mínimo de 5 no es capricho: la tabla lo exige
   * (`contact_messages_phone_length`). Sin esta comprobación, escribir «300» y
   * enviar pasaría el formulario y lo rechazaría la base, y quien está en la
   * tienda vería un «no pudimos guardar tu mensaje» sin saber por qué.
   */
  phone: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.phone, "Ese número es demasiado largo")
    .refine((value) => value === "" || value.length >= 5, {
      message: "Ese número parece incompleto",
    })
    .optional(),

  topic: z
    .string()
    .trim()
    .min(1, "Elige un tema")
    .refine((value) => (CONTACT_TOPICS as readonly string[]).includes(value), {
      message: "Elige un tema de la lista",
    }),

  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poquito más (mínimo 10 caracteres)")
    .max(CONTACT_LIMITS.message, `Máximo ${CONTACT_LIMITS.message} caracteres`),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Lo que de verdad viaja del formulario a la Server Action: el mensaje más la
 * trampa para robots.
 *
 * `website` es un campo que ninguna persona ve —está oculto y fuera del orden
 * de tabulación— pero que un bot que rellena todos los `input` de la página sí
 * completa. No lleva ninguna restricción a propósito: si el esquema lo
 * rechazara, el bot recibiría un error de validación y sabría qué campo evitar
 * la próxima vez. Se acepta, y es la acción la que decide no guardar nada.
 */
export const contactSubmissionSchema = contactSchema.extend({
  website: z.string().optional(),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

/** Nombre del campo trampa. Compartido para que el formulario y la acción no se desincronicen. */
export const HONEYPOT_FIELD = "website" as const;
