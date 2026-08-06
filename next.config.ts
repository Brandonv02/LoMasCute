import type { NextConfig } from "next";

/**
 * Host del proyecto de Supabase, sacado de la propia variable de entorno para
 * que no haya que tocar este archivo al cambiar de proyecto.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Los SVG de producto son propios (no remotos), por eso es seguro habilitarlos.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920, 2560],
    // Imágenes servidas desde los buckets públicos: "products" (catálogo) y
    // "site" (arte de la tienda, hoy la imagen del hero).
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/products/**",
          },
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/site/**",
          },
        ]
      : [],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
