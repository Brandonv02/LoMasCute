import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Páginas personales o transaccionales: no aportan nada al índice
        disallow: ["/checkout", "/favoritos", "/comparar", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
