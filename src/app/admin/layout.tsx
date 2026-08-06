import type { Metadata } from "next";
import "./admin.css";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { adminThemeScript } from "@/components/admin/theme";

export async function generateMetadata(): Promise<Metadata> {
  const name = storeLabel(await getSiteSettings());

  return {
    title: {
      default: `Panel · ${name}`,
      template: `%s · Panel ${name}`,
    },
    description: `Panel de administración de ${name}.`,
    // Un panel no se indexa jamás, ni siquiera uno de demostración.
    robots: { index: false, follow: false, nocache: true },
  };
}

/**
 * Raíz del módulo de administración.
 *
 * El decorado de la tienda (cabecera, footer, atmósfera, carrito) se queda
 * fuera: de eso se encarga <StoreChrome> en el layout raíz. Aquí solo entran
 * los estilos del panel y el arranque del tema.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fija el tema antes del primer pintado: sin destello claro al recargar */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: adminThemeScript }}
      />
      {children}
    </>
  );
}
