import type { Metadata } from "next";
import "./admin.css";
import { site } from "@/config/site";
import { adminThemeScript } from "@/components/admin/theme";

export const metadata: Metadata = {
  title: {
    default: `Panel · ${site.name}`,
    template: `%s · Panel ${site.name}`,
  },
  description: "Panel de administración de Lo Más Cute.",
  // Un panel no se indexa jamás, ni siquiera uno de demostración.
  robots: { index: false, follow: false, nocache: true },
};

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
