import type { Metadata, Viewport } from "next";
import { Fredoka, Poppins } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { Providers } from "@/components/providers";
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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "lo más cute",
    "tienda cute Medellín",
    "maquillaje Medellín",
    "skincare Colombia",
    "accesorios cute",
    "papelería kawaii",
    "regalos Medellín",
    "perfumes suaves",
    "tienda lifestyle Colombia",
  ],
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  applicationName: site.name,
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="relative min-h-dvh antialiased">
        {/* Datos estructurados: organización + sitio con buscador */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema()]),
          }}
        />

        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-display focus:text-ink focus:shadow-lift"
        >
          Saltar al contenido
        </a>

        <Providers>
          <SplashScreen />

          {/* Atmósfera global */}
          <Aurora intensity={0.85} />
          <PastelParticles count={16} />

          <Header />
          <main id="contenido" className="relative z-[2]">
            {children}
          </main>
          <Footer />
          <FloatingSocial />
        </Providers>
      </body>
    </html>
  );
}
