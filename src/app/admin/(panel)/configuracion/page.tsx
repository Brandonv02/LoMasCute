import type { Metadata } from "next";
import { Database } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { messageFor } from "@/services/errors";
import { getSiteSettingsForAdmin } from "@/services/site-settings";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import { PageHeading, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/app/admin/(panel)/configuracion/settings-form";

export const metadata: Metadata = { title: "Configuración" };

// Es un formulario sobre datos vivos: nada que cachear entre visitas.
export const dynamic = "force-dynamic";

/**
 * Configuración de la tienda.
 *
 * Lee y escribe `site_settings`, la única fuente de la información de la
 * tienda: no queda ningún dato escrito a mano en el código. Todo lo que se
 * guarda aquí se ve en la tienda; lo que se deja vacío, no se ve en ningún
 * sitio.
 */
export default async function ConfiguracionPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading
          eyebrow="Sistema"
          title="Configuración"
          description="Marca, hero, redes, pagos y envíos de la tienda."
        />
        <div className="mt-6">
          <SupabaseSetupNotice what="La configuración de la tienda" />
        </div>
      </>
    );
  }

  try {
    const settings = await getSiteSettingsForAdmin();
    return <SettingsForm settings={settings} />;
  } catch (error) {
    // El caso típico: las credenciales están puestas pero todavía no se ha
    // ejecutado 0005_site_settings.sql. Mejor decirlo que reventar.
    return (
      <>
        <PageHeading
          eyebrow="Sistema"
          title="Configuración"
          description="Marca, hero, redes, pagos y envíos de la tienda."
        />
        <Panel className="admin-in mt-6">
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="tone-gold grid size-14 place-items-center rounded-3xl">
              <Database className="size-6" strokeWidth={1.7} />
            </span>
            <p className="admin-title mt-5 text-lg">Falta la tabla de configuración</p>
            <p className="admin-soft mt-2 max-w-md text-sm leading-relaxed">
              Ejecuta{" "}
              <code className="font-mono text-[0.85em]">
                supabase/migrations/0005_site_settings.sql
              </code>{" "}
              en el SQL Editor de Supabase y recarga esta página.
            </p>
            <p className="admin-muted mt-4 max-w-md text-xs leading-relaxed">
              {messageFor(error)}
            </p>
          </div>
        </Panel>
      </>
    );
  }
}
