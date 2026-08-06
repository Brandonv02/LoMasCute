import type { Metadata, Viewport } from "next";
import { Fredoka, Poppins } from "next/font/google";
import "./globals.css";
import { LANGUAGE, LOCALE, SITE_URL } from "@/config/app";
import { socialLinks, storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { getCategories } from "@/services/catalog";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { StoreChrome } from "@/components/layout/store-chrome";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingSocial } from "@/components/layout/floating-social";
import { SplashScreen } from "@/components/splash/splash-screen";
import { Aurora, PastelParticles } from "@/components/atmosphere/ambient";
import { organizationSchema, websiteSchema } from "@/lib/seo";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fredoka",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

/**
 * Metadatos por defecto de toda la tienda.
 *
 * El nombre y la descripción salen de `site_settings`: si nadie los ha escrito
 * todavía, se cae al nombre de la marca y la descripción se omite, en vez de
 * publicar un texto de ejemplo en los buscadores y en las redes.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);
  const description = settings.storeDescription || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s · ${name}` },
    description,
    applicationName: name,
    category: "shopping",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: LOCALE,
      url: SITE_URL,
      siteName: name,
      title: name,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: ["/og-image.png"],
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    formatDetection: { telephone: true, address: false, email: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#FFF7F4" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // El decorado de la tienda (pie y redes flotantes) se alimenta de la
  // configuración: sin datos guardados, esos bloques sencillamente no salen.
  // Las categorías del menú son las del catálogo real, no una lista a mano.
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);
  const name = storeLabel(settings);

  return (
    <html lang={LANGUAGE} className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="relative min-h-dvh antialiased">
        {/* Los ajustes bajan una sola vez para todo el árbol de cliente:
            cabecera, bolsa, checkout y ficha de producto leen de aquí. */}
        <SiteSettingsProvider settings={settings}>
          {/* El decorado de la tienda no acompaña al panel de /admin */}
          <StoreChrome
            jsonLd={
              /* Datos estructurados: organización + sitio con buscador */
              <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify([
                    organizationSchema(settings),
                    websiteSchema(name),
                  ]),
                }}
              />
            }
            splash={<SplashScreen />}
            ambient={
              /* Atmósfera global */
              <>
                <Aurora intensity={0.85} />
                <PastelParticles count={16} />
              </>
            }
            header={<Header categories={categories} />}
            footer={<Footer />}
            floating={
              <FloatingSocial links={socialLinks(settings)} storeName={name} />
            }
          >
            {children}
          </StoreChrome>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
