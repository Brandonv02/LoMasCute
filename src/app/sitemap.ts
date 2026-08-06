import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/app";
import { getCatalog, getCategories } from "@/services/catalog";
import { LEGAL_DOCS } from "@/data/legal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [categories, products] = await Promise.all([getCategories(), getCatalog()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tienda`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((cat) => !cat.comingSoon)
    .map((cat) => ({
      url: `${SITE_URL}/categoria/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/producto/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const legalPages: MetadataRoute.Sitemap = LEGAL_DOCS.map((doc) => ({
    url: `${SITE_URL}/legal/${doc.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...legalPages];
}
