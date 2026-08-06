import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { LEGAL_DOCS, legalBySlug } from "@/data/legal";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const doc = legalBySlug(settings, slug);
  if (!doc) return { title: "Documento no encontrado" };

  return {
    title: doc.title,
    description: doc.intro,
    alternates: { canonical: `/legal/${doc.slug}` },
    openGraph: {
      title: `${doc.title} · ${storeLabel(settings)}`,
      description: doc.intro,
      url: `/legal/${doc.slug}`,
    },
  };
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const doc = legalBySlug(settings, slug);
  if (!doc) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", href: "/" },
          { name: doc.title, href: `/legal/${doc.slug}` },
        ])}
      />

      <PageHeader
        eyebrow={`Actualizado el ${doc.updated}`}
        title={doc.title}
        description={doc.intro}
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: doc.title, href: `/legal/${doc.slug}` },
        ]}
      />

      <section className="pb-24 md:pb-32">
        <div className="container-cute">
          <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
            {/* Índice */}
            <nav aria-label="Otros documentos" className="lg:sticky lg:top-32 lg:self-start">
              <p className="font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
                Documentos
              </p>
              <ul className="mt-4 space-y-1">
                {LEGAL_DOCS.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/legal/${item.slug}`}
                      aria-current={item.slug === doc.slug ? "page" : undefined}
                      className={`block rounded-2xl px-4 py-2.5 text-sm transition-colors duration-400 ${
                        item.slug === doc.slug
                          ? "bg-white/78 font-medium text-ink shadow-petal"
                          : "text-ink-soft hover:bg-white/60 hover:text-ink"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-3xl bg-white/58 p-5 ring-1 ring-white/72">
                <p className="text-sm leading-relaxed text-ink-soft">
                  ¿Alguna duda con esto? Escríbenos y te lo explicamos en
                  palabras normales.
                </p>
                <Link
                  href="/contacto"
                  className="mt-3 inline-block text-sm text-ink underline decoration-rose decoration-2 underline-offset-4"
                >
                  Contactar
                </Link>
              </div>
            </nav>

            {/* Contenido */}
            <article className="max-w-3xl">
              {doc.sections.map((section, i) => (
                <Reveal key={section.heading} kind="up" delay={i * 0.05}>
                  <section className="mb-9 rounded-[1.75rem] bg-white/58 p-7 ring-1 ring-white/72 backdrop-blur-md md:p-9">
                    <h2 className="font-display text-xl text-ink md:text-2xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-3.5">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="leading-relaxed text-ink-soft">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ))}

              <Reveal kind="up">
                <p className="rounded-3xl bg-cream-deep p-6 text-sm leading-relaxed text-ink-muted">
                  Este documento se actualizó el {doc.updated}. Para dudas
                  puntuales escríbenos
                  {settings.contactEmail ? (
                    <>
                      {" "}
                      a{" "}
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="text-ink underline decoration-rose/50 underline-offset-4"
                      >
                        {settings.contactEmail}
                      </a>
                    </>
                  ) : (
                    <>
                      {" "}
                      desde la{" "}
                      <Link
                        href="/contacto"
                        className="text-ink underline decoration-rose/50 underline-offset-4"
                      >
                        página de contacto
                      </Link>
                    </>
                  )}
                  .
                </p>
              </Reveal>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
