import type { Metadata } from "next";
import { Heart, Repeat, Trophy, UserPlus, Users } from "lucide-react";
import {
  EmptyState,
  Meter,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
  type Tone,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Clientes" };

/**
 * Clientes.
 *
 * No existe una tabla de clientas: el checkout todavía no guarda quién compra,
 * así que no hay ni un nombre real que mostrar — y ninguno inventado. La
 * pantalla conserva su estructura y explica qué falta para que se llene.
 */

/** Niveles de fidelidad. Configuración del programa, no datos de nadie. */
const TIERS: { label: string; tone: Tone }[] = [
  { label: "Frecuente", tone: "rose" },
  { label: "Recurrente", tone: "lavender" },
  { label: "Nueva", tone: "mint" },
];

export default function ClientesPage() {
  return (
    <>
      <PageHeading
        eyebrow="Ventas"
        title="Clientes"
        description="Quién compra en la tienda, cada cuánto vuelve y cuánto vale esa relación."
        actions={
          <>
            <button type="button" className="admin-btn admin-btn-primary">
              <UserPlus className="size-4" strokeWidth={2} />
              Agregar clienta
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clientas"
          value="—"
          icon={Users}
          tone="lavender"
          hint="Sin clientas registradas"
        />
        <StatCard
          label="Recurrentes"
          value="—"
          icon={Repeat}
          tone="mint"
          hint="Necesita historial de compras"
          delay={0.05}
        />
        <StatCard
          label="Frecuentes"
          value="—"
          icon={Heart}
          tone="rose"
          hint="Necesita historial de compras"
          delay={0.1}
        />
        <StatCard
          label="Valor total"
          value="—"
          icon={Users}
          tone="gold"
          hint="Sin compras acumuladas"
          delay={0.15}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="admin-in">
          <PanelHeader
            title="Todas las clientas"
            description="Ordenadas por actividad reciente"
          />
          <EmptyState
            icon={Users}
            title="Todavía no hay clientas"
            description="Cuando el checkout guarde los pedidos, cada compradora entrará aquí con su correo, su ciudad y su historial."
          />
        </Panel>

        <Panel className="admin-in">
          <PanelHeader title="Las que más compran" description="Por total gastado" />
          <EmptyState
            icon={Trophy}
            title="Sin ranking todavía"
            description="Este listado se ordena por lo gastado en pedidos entregados."
          />

          <div className="admin-rule my-6" />

          <PanelHeader title="Reparto por nivel" />
          <ul className="mt-4 flex flex-col gap-3">
            {TIERS.map((tier) => (
              <li key={tier.label} className="flex items-center gap-3">
                <StatusPill tone={tier.tone}>{tier.label}</StatusPill>
                <Meter value={0} tone={tier.tone} className="flex-1" />
                <span className="admin-muted w-8 shrink-0 text-right text-xs">—</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
