import type { Metadata } from "next";
import Link from "next/link";
import { CheckCheck, Inbox, Mail, MailOpen } from "lucide-react";
import { isAdminConfigured } from "@/lib/supabase/client";
import type { ContactStatus } from "@/lib/supabase/types";
import { CONTACT_STATUSES } from "@/lib/supabase/types";
import {
  getContactStats,
  listContactMessages,
  type ContactMessage,
} from "@/services/contact";
import { messageFor } from "@/services/errors";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import {
  Avatar,
  EmptyState,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
  Toolbar,
} from "@/components/admin/ui";
import {
  CONTACT_STATUS_META,
  initialsOf,
  messageDateTime,
} from "@/app/admin/(panel)/mensajes/message-meta";
import {
  ContactStatusSelect,
  MessageRowActions,
} from "@/app/admin/(panel)/mensajes/row-controls";

export const metadata: Metadata = { title: "Mensajes" };

// Una bandeja de entrada que se cachea es una bandeja que miente.
export const dynamic = "force-dynamic";

/**
 * Mensajes: lo que la gente escribe desde /contacto.
 *
 * Los filtros viven en la URL y no en estado de cliente —igual que en Pedidos y
 * en el catálogo— para que se puedan compartir, recargar y volver atrás sin
 * perder el contexto.
 */

const DESCRIPTION =
  "Todo lo que llega por el formulario de la tienda, de lo más reciente a lo más antiguo.";

const columns: Column<ContactMessage>[] = [
  {
    key: "sender",
    header: "Quién escribe",
    render: (message) => (
      <span className="flex min-w-0 items-center gap-3">
        <Avatar
          initials={initialsOf(message.name)}
          tone={message.status === "nuevo" ? "rose" : "neutral"}
          size="sm"
        />
        <span className="min-w-0">
          <span className="block truncate" style={{ color: "var(--admin-ink)" }}>
            {message.name}
          </span>
          <span className="admin-muted block truncate text-xs">{message.email}</span>
        </span>
      </span>
    ),
  },
  {
    key: "topic",
    header: "Tema",
    hideBelow: "sm",
    render: (message) => (
      <StatusPill tone="neutral" plain>
        {message.topic}
      </StatusPill>
    ),
  },
  {
    key: "message",
    header: "Mensaje",
    hideBelow: "lg",
    render: (message) => (
      // Recortado a una línea: el texto completo está en la ficha, y una celda
      // de tres párrafos rompe la tabla.
      <span className="admin-muted block max-w-[22rem] truncate text-xs">
        {message.message}
      </span>
    ),
  },
  {
    key: "date",
    header: "Recibido",
    hideBelow: "md",
    render: (message) => messageDateTime(message.createdAt),
  },
  {
    key: "status",
    header: "Estado",
    render: (message) => <ContactStatusSelect id={message.id} status={message.status} />,
  },
  {
    key: "actions",
    header: "Acciones",
    align: "right",
    render: (message) => <MessageRowActions id={message.id} name={message.name} />,
  },
];

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; eliminado?: string }>;
}) {
  const heading = () => (
    <PageHeading eyebrow="Atención" title="Mensajes" description={DESCRIPTION} />
  );

  if (!isAdminConfigured()) {
    return (
      <>
        {heading()}
        <SupabaseSetupNotice what="La bandeja de mensajes" />
      </>
    );
  }

  const params = await searchParams;
  const status = (params.estado ?? "all") as ContactStatus | "all";

  /**
   * `contact_messages` es privada del todo: solo la abre `service_role`. Si esa
   * clave falla —es la publicable, se rotó— el panel lo cuenta en vez de
   * caerse, porque ese mensaje de error es justo lo que hay que arreglar.
   */
  let messages: ContactMessage[];
  let stats: Awaited<ReturnType<typeof getContactStats>>;

  try {
    [messages, stats] = await Promise.all([
      listContactMessages({ search: params.q, status }),
      getContactStats(),
    ]);
  } catch (error) {
    return (
      <>
        {heading()}
        <Panel className="admin-in">
          <EmptyState
            icon={Inbox}
            title="No se pudieron leer los mensajes"
            description={messageFor(error)}
          />
        </Panel>
      </>
    );
  }

  const filtered = Boolean(params.q) || status !== "all";

  /** Cambia un filtro conservando los demás */
  const hrefWith = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: params.q, estado: params.estado, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "all") next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin/mensajes?${query}` : "/admin/mensajes";
  };

  return (
    <>
      {heading()}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sin abrir"
          value={String(stats.byStatus.nuevo)}
          icon={Mail}
          tone="rose"
          hint="esperan respuesta"
        />
        <StatCard
          label="Leídos"
          value={String(stats.byStatus.leido)}
          icon={MailOpen}
          tone="gold"
          hint="vistos, sin responder"
          delay={0.05}
        />
        <StatCard
          label="Respondidos"
          value={String(stats.byStatus.respondido)}
          icon={CheckCheck}
          tone="mint"
          hint="cerrados"
          delay={0.1}
        />
        <StatCard
          label="Recibidos"
          value={String(stats.total)}
          icon={Inbox}
          tone="lavender"
          hint="en total"
          delay={0.15}
        />
      </div>

      {params.eliminado && (
        <div
          role="status"
          className="tone-mint admin-in flex items-center gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          Mensaje eliminado.
        </div>
      )}

      {/* Estados */}
      <Panel className="admin-in">
        <PanelHeader title="Por estado" description="Qué queda por atender" />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CONTACT_STATUSES.map((option) => (
            <li key={option}>
              <Link
                href={hrefWith({ estado: status === option ? "all" : option })}
                className="admin-inset block p-4 transition-opacity duration-300 hover:opacity-80"
              >
                <StatusPill tone={CONTACT_STATUS_META[option].tone}>
                  {CONTACT_STATUS_META[option].label}
                </StatusPill>
                <p className="admin-title mt-3 text-2xl">{stats.byStatus[option]}</p>
                <p className="admin-muted mt-1 text-xs">
                  {CONTACT_STATUS_META[option].hint}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="admin-in">
        <PanelHeader
          title="Bandeja"
          description="Al abrir un mensaje se ve completo y con los datos para responder"
        />

        <form className="mt-5" method="get">
          <Toolbar
            placeholder="Buscar por nombre, correo, tema o texto del mensaje…"
            name="q"
            defaultValue={params.q}
          >
            {status !== "all" && <input type="hidden" name="estado" value={status} />}
          </Toolbar>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", ...CONTACT_STATUSES] as const).map((option) => (
            <Link
              key={option}
              href={hrefWith({ estado: option })}
              className={`admin-btn px-4 py-2 text-[0.82rem] ${
                status === option ? "admin-btn-primary" : ""
              }`}
            >
              {option === "all" ? "Todos" : CONTACT_STATUS_META[option].label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          {messages.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={filtered ? "Nada con ese filtro" : "La bandeja está vacía"}
              description={
                filtered
                  ? "Prueba con otra búsqueda o quita los filtros."
                  : "Cuando alguien escriba desde /contacto, su mensaje aparecerá aquí con su correo y su teléfono para responderle."
              }
              action={
                filtered ? (
                  <Link href="/admin/mensajes" className="admin-btn">
                    Quitar filtros
                  </Link>
                ) : (
                  <Link href="/contacto" className="admin-btn">
                    Ver el formulario
                  </Link>
                )
              }
            />
          ) : (
            <DataTable
              caption="Mensajes recibidos desde el formulario de contacto"
              columns={columns}
              rows={messages}
              minWidth="56rem"
              footer={
                <>
                  <span>
                    Mostrando {messages.length} de {stats.total}{" "}
                    {stats.total === 1 ? "mensaje" : "mensajes"}
                  </span>
                  <span>
                    {stats.byStatus.archivado}{" "}
                    {stats.byStatus.archivado === 1 ? "archivado" : "archivados"}
                  </span>
                </>
              }
            />
          )}
        </div>
      </Panel>
    </>
  );
}
