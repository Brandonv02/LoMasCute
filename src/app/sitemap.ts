import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getCatalog, getCategories } from "@/services/catalog";
import { legalDocs } from "@/data/legal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [categories, products] = await Promise.all([getCategories(), getCatalog()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/tienda`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((cat) => !cat.comingSoon)
    .map((cat) => ({
      url: `${site.url}/categoria/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${site.url}/producto/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const legalPages: MetadataRoute.Sitemap = legalDocs.map((doc) => ({
    url: `${site.url}/legal/${doc.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...legalPages];
}
