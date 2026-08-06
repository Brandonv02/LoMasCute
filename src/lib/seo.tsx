import { activeZone, site } from "@/config/site";
import type { Product } from "@/lib/types";
import { reviewsForProduct, storeFaqs } from "@/data/reviews";
import {
  socialLinks,
  type SiteSettings,
} from "@/lib/site-settings";

/**
 * Schema.org — organización de la tienda.
 *
 * Se alimenta de `site_settings`: solo declara lo que alguien ha configurado.
 * Un dato estructurado inventado no es decorado, es desinformación indexable.
 */
export function organizationSchema(settings: SiteSettings) {
  const name = settings.storeName || site.name;
  const sameAs = socialLinks(settings)
    .filter((link) => link.icon !== "whatsapp")
    .map((link) => link.url);

  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${site.url}#organization`,
    name,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    image: `${site.url}/og-image.png`,
    priceRange: "$$",
    currenciesAccepted: site.currency,
    ...(settings.storeDescription && { description: settings.storeDescription }),
    ...(settings.contactEmail && { email: settings.contactEmail }),
    ...(settings.whatsappNumber && { telephone: `+${settings.whatsappNumber}` }),
    ...(settings.paymentMethods.length && {
      paymentAccepted: settings.paymentMethods.join(", "),
    }),
    ...(sameAs.length && { sameAs }),
  };
}

/** Schema.org — sitio con acción de búsqueda */
export function websiteSchema(name: string = site.name) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}#website`,
    url: site.url,
    name,
    inLanguage: "es-CO",
    publisher: { "@id": `${site.url}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/tienda?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Schema.org — producto con oferta, envío y opiniones */
export function productSchema(product: Product) {
  const productReviews = reviewsForProduct(product.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/producto/${product.slug}#product`,
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((i) => `${site.url}${i}`),
    brand: { "@type": "Brand", name: site.name },
    category: product.category,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: 5,
    },
    review: productReviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    offers: {
      "@type": "Offer",
      url: `${site.url}/producto/${product.slug}`,
      priceCurrency: site.currency,
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${site.url}#organization` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: activeZone.price,
          currency: site.currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "CO",
          addressRegion: "Antioquia",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CO",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };
}

/** Schema.org — miga de pan */
export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.href}`,
    })),
  };
}

/** Schema.org — preguntas frecuentes de la tienda */
export function faqSchema(faqs: { q: string; a: string }[] = storeFaqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Schema.org — listado de productos (categoría / tienda) */
export function itemListSchema(products: Product[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/producto/${p.slug}`,
      name: p.name,
    })),
  };
}

/** Helper para inyectar JSON-LD en cualquier página */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
