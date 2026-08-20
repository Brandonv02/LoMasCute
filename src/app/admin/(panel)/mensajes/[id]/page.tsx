import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Mail, MessageCircle, Phone, Tag } from "lucide-react";
import { isAdminConfigured } from "@/lib/supabase/client";
import { getContactMessage } from "@/services/contact";
import { telHref } from "@/lib/site-settings";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import {
  Avatar,
  PageHeading,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/admin/ui";
import {
  CONTACT_STATUS_META,
  initialsOf,
  messageDateLong,
} from "@/app/admin/(panel)/mensajes/message-meta";
import {
  DeleteMessageButton,
  MessageStatusButtons,
} from "@/app/admin/(panel)/mensajes/row-controls";

export const metadata: Metadata = { title: "Mensaje" };
export const dynamic = "force-dynamic";

/**
 * Ficha de un mensaje.
 *
 * Aquí se lee completo y se responde. El estado no se toca solo al abrir: que
 * el panel escriba en la base por el hecho de pintar una pantalla haría que un
 * prefetch del navegador marcara como leído algo que nadie leyó. Se marca a
 * mano, con los botones de abajo.
 */

/** Fila de dato: etiqueta a la izquierda, valor a la derecha */
function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 border-b py-3.5 last:border-0"
      style={{ borderColor: "var(--admin-line-soft)" }}
    >
      <p
        className="flex items-center gap-2 text-[0.9rem]"
        style={{ color: "var(--admin-ink)" }}
      >
        {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.9} />}
        {label}
      </p>
      <div className="admin-soft min-w-0 text-right text-[0.9rem]">{value}</div>
    </div>
  );
}

export default async function MensajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isAdminConfigured()) {
    return (
      <>
        <PageHeading eyebrow="Atención" title="Mensaje" />
        <SupabaseSetupNotice what="La bandeja de mensajes" />
      </>
    );
  }

  const { id } = await params;
  const message = await getContactMessage(id);
  if (!message) notFound();

  const meta = CONTACT_STATUS_META[message.status];
  const phone = message.phone ? telHref(message.phone) : "";

  /**
   * Respuesta por correo, con el asunto ya escrito.
   *
   * Se abre en el cliente de correo de quien atiende: la tienda no envía nada
   * todavía, así que fingir un "responder desde el panel" sería mentir sobre
   * lo que el botón hace.
   */
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(
    `Re: ${message.topic}`,
  )}`;

  return (
    <>
      <PageHeading
        eyebrow="Atención"
        title={message.name}
        description={`${message.topic} · ${messageDateLong(message.createdAt)}`}
        actions={
          <>
            <Link href="/admin/mensajes" className="admin-btn">
              <ArrowLeft className="size-4" strokeWidth={2} />
              Volver
            </Link>
            <a href={replyHref} className="admin-btn admin-btn-primary">
              <Mail className="size-4" strokeWidth={2} />
              Responder por correo
            </a>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Mensaje */}
        <Panel className="admin-in">
          <PanelHeader
            title="El mensaje"
            description="Tal como lo escribió"
            action={<StatusPill tone={meta.tone}>{meta.label}</StatusPill>}
          />

          {/*
            `whitespace-pre-line` respeta los saltos de línea que puso la
            persona sin interpretar nada más: el texto se pinta como texto, y
            React ya escapa cualquier cosa que venga dentro.
          */}
          <p
            className="mt-6 whitespace-pre-line text-[0.95rem] leading-relaxed"
            style={{ color: "var(--admin-ink)" }}
          >
            {message.message}
          </p>

          <div className="admin-rule my-7" />

          <div>
            <p className="admin-eyebrow">Estado</p>
            <p className="admin-muted mt-1.5 mb-4 text-xs">
              Marca «respondido» cuando ya le hayas contestado, o archívalo para
              sacarlo de la bandeja sin borrarlo.
            </p>
            <MessageStatusButtons id={message.id} status={message.status} />
          </div>
        </Panel>

        {/* Quién escribe */}
        <div className="flex flex-col gap-6">
          <Panel className="admin-in">
            <div className="flex items-center gap-3.5">
              <Avatar initials={initialsOf(message.name)} tone={meta.tone} />
              <div className="min-w-0">
                <p className="admin-title truncate text-[1.05rem]">{message.name}</p>
                <p className="admin-muted truncate text-xs">{message.email}</p>
              </div>
            </div>

            <div className="mt-5">
              <Row
                icon={Mail}
                label="Correo"
                value={
                  <a
                    href={replyHref}
                    className="underline decoration-dotted underline-offset-4"
                  >
                    {message.email}
                  </a>
                }
              />
              <Row
                icon={Phone}
                label="Teléfono"
                value={
                  message.phone ? (
                    phone ? (
                      <a
                        href={phone}
                        className="underline decoration-dotted underline-offset-4"
                      >
                        {message.phone}
                      </a>
                    ) : (
                      message.phone
                    )
                  ) : (
                    <span className="admin-muted">No lo dejó</span>
                  )
                }
              />
              <Row icon={Tag} label="Tema" value={message.topic} />
              <Row
                icon={Calendar}
                label="Recibido"
                value={messageDateLong(message.createdAt)}
              />
              {message.updatedAt !== message.createdAt && (
                <Row
                  icon={MessageCircle}
                  label="Último cambio de estado"
                  value={messageDateLong(message.updatedAt)}
                />
              )}
            </div>
          </Panel>

          <Panel className="admin-in">
            <PanelHeader
              title="Eliminar"
              description="Archivar lo saca de la bandeja y lo conserva. Eliminar es definitivo."
            />
            <div className="mt-5">
              <DeleteMessageButton id={message.id} name={message.name} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
