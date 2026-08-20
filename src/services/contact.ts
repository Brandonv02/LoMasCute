import "server-only";

import { adminClient } from "@/lib/supabase/client";
import type { ContactMessageRow, ContactStatus } from "@/lib/supabase/types";
import { contactSchema, type ContactInput } from "@/lib/contact";
import { ServiceError, toServiceError } from "@/services/errors";

/**
 * Servicio de mensajes de contacto: la única puerta a `contact_messages`.
 *
 * Usa `service_role` siempre, también para escribir desde la tienda pública.
 * La tabla lleva nombre, correo y teléfono de quien escribe, así que no tiene
 * ni lectura ni escritura para `anon`: RLS está activo y sin políticas (ver
 * 0011_contact_messages.sql). Que la inserción pase por aquí, en el servidor,
 * es lo que permite limitar los envíos antes de tocar la base.
 */

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContactFilters = {
  search?: string;
  status?: ContactStatus | "all";
};

export type ContactStats = {
  total: number;
  byStatus: Record<ContactStatus, number>;
  /** Los que todavía nadie ha abierto: es la cifra que importa al entrar. */
  pending: number;
};

function toMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    topic: row.topic,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ---------------------------------------------------------------- escritura */

/**
 * Cuántos mensajes admite un mismo correo por hora.
 *
 * Que quede claro lo que esto es y lo que no es: **no** es antiabuso. Quien
 * quiera saltarlo cambia de correo y ya. Lo que evita es el duplicado por
 * doble clic y el spam casual del que manda el mismo mensaje seis veces
 * seguidas. El límite serio va en el borde —Vercel, Cloudflare— donde se ve la
 * IP; aquí solo se ve lo que la persona escribió.
 */
const MAX_PER_EMAIL_PER_HOUR = 5;

/**
 * Guarda un mensaje del formulario de contacto.
 *
 * Se valida aquí además de en el formulario porque la Server Action que llama
 * a esta función es un endpoint HTTP: cualquiera puede invocarla sin pasar por
 * la interfaz.
 *
 * Todos los `ServiceError` que salen de aquí están escritos para que los lea
 * un visitante de la tienda, no un administrador. Es la diferencia con el
 * resto de servicios del proyecto y es a propósito: si un fallo de Postgres
 * saliera con su mensaje original, la tienda le estaría contando a un
 * desconocido cómo se llama la restricción que saltó.
 */
export async function createContactMessage(input: ContactInput): Promise<string> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    // El primero basta: el formulario ya señala campo por campo, y quien llega
    // por fuera de la interfaz no necesita un informe.
    throw new ServiceError(
      parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    );
  }

  const { name, email, phone, topic, message } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await adminClient()
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizedEmail)
    .gte("created_at", since);

  // Si el conteo falla no se bloquea el envío: perder un mensaje real es peor
  // que aceptar uno repetido. Queda anotado y se sigue.
  if (countError) {
    console.error("[contacto] no se pudo contar envíos recientes:", countError.message);
  } else if ((count ?? 0) >= MAX_PER_EMAIL_PER_HOUR) {
    throw new ServiceError(
      "Ya recibimos varios mensajes desde este correo en la última hora. " +
        "Estamos leyéndolos: si es urgente, escríbenos por WhatsApp.",
    );
  }

  const { data, error } = await adminClient()
    .from("contact_messages")
    .insert({
      name,
      email: normalizedEmail,
      // Cadena vacía y NULL significan lo mismo aquí, y la base solo admite
      // una de las dos: la restricción de longitud rechaza el texto vacío.
      phone: phone?.trim() ? phone.trim() : null,
      topic,
      message,
    })
    .select("id")
    .single();

  if (error) {
    // El detalle va al log; el visitante recibe algo que puede accionar.
    console.error("[contacto] no se pudo guardar el mensaje:", error.message);
    throw new ServiceError(
      "No pudimos guardar tu mensaje. Vuelve a intentarlo en un momento.",
    );
  }

  return data.id;
}

/* ------------------------------------------------------------------ lectura */

export async function listContactMessages(
  filters: ContactFilters = {},
): Promise<ContactMessage[]> {
  let query = adminClient()
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const search = filters.search?.trim();
  if (search) {
    // Se busca también dentro del mensaje: muchas veces se recuerda una
    // palabra de lo que escribieron y no quién lo escribió.
    const term = `%${search.replace(/[%,]/g, "")}%`;
    query = query.or(
      `name.ilike.${term},email.ilike.${term},phone.ilike.${term},topic.ilike.${term},message.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) throw toServiceError(error);

  return (data ?? []).map(toMessage);
}

export async function getContactMessage(id: string): Promise<ContactMessage | null> {
  const { data, error } = await adminClient()
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw toServiceError(error);
  return data ? toMessage(data) : null;
}

export async function getContactStats(): Promise<ContactStats> {
  const { data, error } = await adminClient().from("contact_messages").select("status");

  if (error) throw toServiceError(error);

  const rows = data ?? [];
  const byStatus: Record<ContactStatus, number> = {
    nuevo: 0,
    leido: 0,
    respondido: 0,
    archivado: 0,
  };

  for (const row of rows) byStatus[row.status] += 1;

  return { total: rows.length, byStatus, pending: byStatus.nuevo };
}

/**
 * Mensajes sin abrir, para la pastilla del menú del panel.
 *
 * Nunca lanza. Se llama desde el layout, así que un fallo aquí —base caída,
 * clave rotada— tumbaría **todas** las pantallas del panel, incluida la que
 * explica qué credencial falta. Un contador es un adorno: si no se puede
 * calcular, no se pinta.
 */
export async function countNewContactMessages(): Promise<number> {
  try {
    const { count, error } = await adminClient()
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "nuevo");

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function setContactMessageStatus(
  id: string,
  status: ContactStatus,
): Promise<void> {
  const { error } = await adminClient()
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) throw toServiceError(error);
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await adminClient().from("contact_messages").delete().eq("id", id);
  if (error) throw toServiceError(error);
}
