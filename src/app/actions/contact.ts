"use server";

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { contactSubmissionSchema } from "@/lib/contact";
import { createContactMessage } from "@/services/contact";
import { ServiceError } from "@/services/errors";

/**
 * Envío del formulario de contacto.
 *
 * Es el único camino por el que un visitante escribe en la base. La tabla está
 * cerrada a la clave pública (ver 0011_contact_messages.sql), así que no hay
 * forma de insertar desde el navegador: tiene que pasar por aquí, donde se
 * puede validar y limitar.
 *
 * Nunca lanza. Un formulario que revienta con una pantalla de error pierde el
 * mensaje que alguien acababa de escribir; este devuelve siempre algo que la
 * interfaz puede pintar.
 */

export type ContactResult = { ok: true } | { ok: false; message: string };

/** Lo que se le dice a alguien cuando el fallo no es culpa suya ni cosa suya. */
const GENERIC_FAILURE =
  "No pudimos enviar tu mensaje. Vuelve a intentarlo en un momento o " +
  "escríbenos por WhatsApp.";

export async function submitContactMessage(input: unknown): Promise<ContactResult> {
  const parsed = contactSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  const { website, ...message } = parsed.data;

  /**
   * La trampa venía rellena: es un robot.
   *
   * Se responde que todo salió bien y no se guarda nada. Devolverle un error
   * sería enseñarle qué campo tiene que dejar vacío la próxima vez.
   */
  if (website?.trim()) return { ok: true };

  if (!isSupabaseConfigured()) {
    console.error(
      "[contacto] mensaje descartado: Supabase no está configurado en este entorno.",
    );
    return { ok: false, message: GENERIC_FAILURE };
  }

  try {
    await createContactMessage(message);
    return { ok: true };
  } catch (error) {
    /**
     * Solo los `ServiceError` llegan a la pantalla.
     *
     * El servicio los escribe pensando en quien está en la tienda ("ya
     * recibimos varios mensajes desde este correo…"). Cualquier otro fallo es
     * de infraestructura y no se le cuenta a un desconocido: el detalle va al
     * log del servidor, que es donde alguien puede hacer algo con él.
     */
    if (error instanceof ServiceError) {
      return { ok: false, message: error.message };
    }

    console.error("[contacto] fallo inesperado al enviar el mensaje:", error);
    return { ok: false, message: GENERIC_FAILURE };
  }
}
