import { Database, Terminal } from "lucide-react";
import { Panel } from "@/components/admin/ui";

/**
 * Estado del panel cuando todavía no hay proyecto de Supabase conectado.
 *
 * Existe para que el módulo se pueda construir y abrir sin credenciales: sin
 * esto, cualquier `npm run build` en una máquina limpia reventaría al intentar
 * consultar la base.
 */
export function SupabaseSetupNotice({ what = "esta sección" }: { what?: string }) {
  return (
    <Panel className="admin-in">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="tone-gold grid size-14 place-items-center rounded-3xl">
          <Database className="size-6" strokeWidth={1.7} />
        </span>

        <p className="admin-title mt-5 text-lg">Falta conectar Supabase</p>
        <p className="admin-soft mt-2 max-w-md text-sm leading-relaxed">
          {what} lee de la base de datos y todavía no hay credenciales. Crea un
          archivo <code className="font-mono text-[0.85em]">.env.local</code> en
          la raíz del proyecto con estas tres variables y reinicia el servidor.
        </p>

        <pre className="admin-inset mt-6 w-full max-w-xl overflow-x-auto p-5 text-left font-mono text-xs leading-relaxed">
          <code>
            {`NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave anónima>
SUPABASE_SERVICE_ROLE_KEY=<clave service_role>`}
          </code>
        </pre>

        <p className="admin-muted mt-5 flex items-center gap-2 text-xs">
          <Terminal className="size-3.5" strokeWidth={1.9} />
          El paso a paso completo está en <code className="font-mono">supabase/README.md</code>
        </p>
      </div>
    </Panel>
  );
}
