import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FavoritesList } from "@/components/product/favorites-list";

export const metadata: Metadata = {
  title: "Mis favoritos",
  description:
    "Los productos de Lo Más Cute que guardaste para después. Se quedan aquí en tu navegador, sin necesidad de crear cuenta.",
  alternates: { canonical: "/favoritos" },
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tu lista"
        title="Mis"
        highlight="favoritos"
        description="Todo lo que guardaste con el corazoncito. Se queda aquí guardado en tu navegador, aunque cierres la página."
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Mis favoritos", href: "/favoritos" },
        ]}
      />

      <section className="pb-24 md:pb-32">
        <FavoritesList />
      </section>
    </>
  );
}
