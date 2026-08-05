import type { Metadata } from "next";
import {
  Bell,
  CreditCard,
  Database,
  Globe,
  MapPin,
  Palette,
  Truck,
  Users,
} from "lucide-react";
import { site } from "@/config/site";
import { formatCOP } from "@/lib/utils";
import {
  PageHeading,
  Panel,
  PanelHeader,
  StatusPill,
  type Tone,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Configuración" };

/** Fila de dato: etiqueta a la izquierda, valor a la derecha */
function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 py-3.5">
      <div className="min-w-0">
        <p className="text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
          {label}
        </p>
        {hint && <p className="admin-muted mt-0.5 text-xs">{hint}</p>}
      </div>
      <div className="admin-soft min-w-0 text-right text-[0.9rem]">{value}</div>
    </div>
  );
}

/** Interruptor decorativo: aquí todavía no hay nada que guardar */
function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-500"
      style={{
        background: on
          ? "linear-gradient(100deg, var(--color-rose), var(--color-lavender))"
          : "var(--admin-line)",
      }}
    >
      <span
        className="size-5 rounded-full bg-white shadow-petal transition-transform duration-500 [transition-timing-function:var(--ease-petal)]"
        style={{ transform: on ? "translateX(1.25rem)" : "translateX(0)" }}
      />
    </span>
  );
}

const paletteTones: { name: string; token: string; tone: Tone }[] = [
  { name: "Rosa", token: "--color-rose", tone: "rose" },
  { name: "Menta", token: "--color-mint", tone: "mint" },
  { name: "Lavanda", token: "--color-lavender", tone: "lavender" },
  { name: "Durazno", token: "--color-peach", tone: "peach" },
  { name: "Dorado", token: "--color-gold", tone: "gold" },
];

export default function ConfiguracionPage() {
  const zone = site.shipping.zones.find((z) => z.active) ?? site.shipping.zones[0];
  const payments = site.payments;

  return (
    <>
      <PageHeading
        eyebrow="Sistema"
        title="Configuración"
        description="Los datos que gobiernan la tienda. Hoy se leen del archivo de configuración; cuando exista backend, se editarán desde aquí."
        actions={
          <button type="button" className="admin-btn admin-btn-primary">
            Guardar cambios
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Marca */}
        <Panel className="admin-in">
          <PanelHeader
            title="Marca"
            description="Identidad pública de la tienda"
            action={
              <span className="tone-rose grid size-10 place-items-center rounded-2xl">
                <Globe className="size-5" strokeWidth={1.8} />
              </span>
            }
          />
          <div className="admin-rule mt-5" />
          <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
            <Row label="Nombre" value={site.name} />
            <Row label="Razón social" value={site.legalName} />
            <Row label="Eslogan" value={site.tagline} />
            <Row label="Dominio" value={site.url.replace("https://", "")} />
            <Row label="Idioma y moneda" value={`${site.locale} · ${site.currency}`} />
          </div>
        </Panel>

        {/* Contacto */}
        <Panel className="admin-in">
          <PanelHeader
            title="Contacto"
            description="Cómo llega la clienta al equipo"
            action={
              <span className="tone-mint grid size-10 place-items-center rounded-2xl">
                <MapPin className="size-5" strokeWidth={1.8} />
              </span>
            }
          />
          <div className="admin-rule mt-5" />
          <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
            <Row label="Correo" value={site.contact.email} />
            <Row label="WhatsApp" value={site.contact.whatsappDisplay} hint="Canal principal de soporte" />
            <Row label="Dirección" value={site.contact.address} />
            <Row label="Horario" value={site.contact.schedule} />
          </div>
        </Panel>

        {/* Envíos */}
        <Panel className="admin-in">
          <PanelHeader
            title="Envíos"
            description="Cobertura y tarifas"
            action={
              <span className="tone-peach grid size-10 place-items-center rounded-2xl">
                <Truck className="size-5" strokeWidth={1.8} />
              </span>
            }
          />
          <div className="admin-rule mt-5" />
          <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
            <Row
              label={zone.label}
              value={<StatusPill tone="mint">Activa</StatusPill>}
              hint={`${zone.neighborhoods.length} barrios cubiertos`}
            />
            <Row label="Costo de envío" value={formatCOP(zone.price)} />
            <Row label="Envío gratis desde" value={formatCOP(zone.freeFrom)} />
            <Row label="Tiempo de entrega" value={zone.eta} />
          </div>

          <ul className="mt-5 flex flex-wrap gap-1.5">
            {zone.neighborhoods.slice(0, 8).map((neighborhood) => (
              <li key={neighborhood}>
                <StatusPill tone="neutral" plain>
                  {neighborhood}
                </StatusPill>
              </li>
            ))}
            {zone.neighborhoods.length > 8 && (
              <li>
                <StatusPill tone="neutral" plain>
                  +{zone.neighborhoods.length - 8}
                </StatusPill>
              </li>
            )}
          </ul>
        </Panel>

        {/* Pagos */}
        <Panel className="admin-in">
          <PanelHeader
            title="Métodos de pago"
            description="Lo que la clienta puede usar al pagar"
            action={
              <span className="tone-lavender grid size-10 place-items-center rounded-2xl">
                <CreditCard className="size-5" strokeWidth={1.8} />
              </span>
            }
          />
          <div className="admin-rule mt-5" />
          <ul className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-4 py-3.5">
                <span className="min-w-0">
                  <span className="block text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
                    {payment.label}
                  </span>
                  <span className="admin-muted block text-xs">
                    {payment.active ? "Disponible en el checkout" : "Oculto para la clienta"}
                  </span>
                </span>
                <Toggle on={payment.active} />
              </li>
            ))}
          </ul>
        </Panel>

        {/* Apariencia */}
        <Panel className="admin-in">
          <PanelHeader
            title="Apariencia"
            description="Los tokens de color de la marca"
            action={
              <span className="tone-gold grid size-10 place-items-center rounded-2xl">
                <Palette className="size-5" strokeWidth={1.8} />
              </span>
            }
          />
          <ul className="mt-5 grid grid-cols-5 gap-3">
            {paletteTones.map((color) => (
              <li key={color.name} className="text-center">
                <span
                  aria-hidden
                  className="block aspect-square rounded-2xl ring-1"
                  style={{
                    background: `var(${color.token})`,
                    ["--tw-ring-color" as string]: "var(--admin-line)",
                  }}
                />
                <span className="admin-muted mt-2 block text-[0.7rem]">{color.name}</span>
              </li>
            ))}
          </ul>

          <div className="admin-rule my-5" />

          <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
            <Row label="Tipografía de títulos" value="Fredoka" />
            <Row label="Tipografía de texto" value="Poppins" />
            <Row
              label="Modo oscuro del panel"
              value={<StatusPill tone="lavender">Disponible</StatusPill>}
              hint="Solo dentro de /admin; la tienda se mantiene clara"
            />
          </div>
        </Panel>

        {/* Sistema */}
        <Panel className="admin-in">
          <PanelHeader
            title="Sistema"
            description="Estado del módulo de administración"
            action={
              <span className="tone-neutral grid size-10 place-items-center rounded-2xl">
                <Database className="size-5" strokeWidth={1.8} />
              </span>
            }
          />
          <div className="admin-rule mt-5" />
          <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
            <Row
              label="Base de datos"
              value={<StatusPill tone="neutral">Sin conectar</StatusPill>}
              hint="Los datos que ves son simulados"
            />
            <Row
              label="Autenticación"
              value={<StatusPill tone="neutral">Sin implementar</StatusPill>}
              hint="El acceso todavía no valida credenciales"
            />
            <Row
              label="Equipo"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" strokeWidth={1.9} />1 persona
                </span>
              }
            />
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            <li className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2.5 text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
                <Bell className="size-4" strokeWidth={1.9} />
                Avisar cuando entre un pedido
              </span>
              <Toggle on />
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2.5 text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
                <Bell className="size-4" strokeWidth={1.9} />
                Avisar cuando un producto baje del umbral
              </span>
              <Toggle on />
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
