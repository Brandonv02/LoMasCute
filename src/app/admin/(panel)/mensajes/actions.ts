"use server";

import { revalidatePath } from "next/cache";
import type { ContactStatus } from "@/lib/supabase/types";
import { messageFor } from "@/services/errors";
import {
  deleteContactMessage,
  setContactMessageStatus,
} from "@/services/contact";

/**
 * Server Actions de la bandeja de mensajes.
 *
 * Solo cambian el estado o borran: el contenido de un mensaje no se edita
 * nunca. Lo que escribió una persona es un hecho, no un campo del panel.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

const SECTION = "/admin/mensajes";

/** El contador de la barra lateral cuelga del layout: se refresca con la ruta. */
function refresh() {
  revalidatePath(SECTION);
  revalidatePath("/admin/dashboard");
}

export async function setContactStatusAction(
  id: string,
  status: ContactStatus,
): Promise<ActionResult> {
  try {
    await setContactMessageStatus(id, status);
    refresh();
    revalidatePath(`${SECTION}/${id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function deleteContactMessageAction(id: string): Promise<ActionResult> {
  try {
    await deleteContactMessage(id);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}
