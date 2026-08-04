import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CompareTable } from "@/components/product/compare-table";

export const metadata: Metadata = {
  title: "Comparar productos",
  description:
    "Compara hasta tres productos de Lo Más Cute lado a lado: precio, tonos, calificación y beneficios.",
  alternates: { canonical: "/comparar" },
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return (
    <>
      <PageHeader
        eyebrow="Decide con calma"
        title="Comparar"
        highlight="productos"
        description="Precio, tonos, calificación y beneficios, uno al lado del otro. Puedes comparar hasta tres a la vez."
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Comparar", href: "/comparar" },
        ]}
      />

      <section className="pb-24 md:pb-32">
        <CompareTable />
      </section>
    </>
  );
}
