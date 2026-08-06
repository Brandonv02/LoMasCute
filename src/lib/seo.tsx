import {
  COUNTRY_CODE,
  CURRENCY,
  LANGUAGE,
  SITE_URL,
} from "@/config/app";
import type { Product } from "@/lib/types";
import {
  socialLinks,
  storeLabel,
  type SiteSettings,
} from "@/lib/site-settings";

/**
 * Schema.org — organización de la tienda.
 *
 * Se alimenta de `site_settings`: solo declara lo que alguien ha configurado.
 * Un dato estructurado inventado no es decorado, es desinformación indexable.
 */
export function organizationSchema(settings: SiteSettings) {
  const sameAs = socialLinks(settings)
    .filter((link) => link.icon !== "whatsapp")
    .map((link) => link.url);

  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}#organization`,
    name: storeLabel(settings),
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/og-image.png`,
    priceRange: "$$",
    currenciesAccepted: CURRENCY,
    ...(settings.storeDescription && { description: settings.storeDescription }),
    ...(settings.contactEmail && { email: settings.contactEmail }),
    ...(settings.whatsappNumber && { telephone: `+${settings.whatsappNumber}` }),
    ...(settings.contactPhone && !settings.whatsappNumber && {
      telephone: settings.contactPhone,
    }),
    ...(settings.businessHours && { openingHours: settings.businessHours }),
    ...(settings.storeAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.storeAddress,
        ...(settings.storeCity && { addressLocality: settings.storeCity }),
        addressCountry: COUNTRY_CODE,
      },
    }),
    ...(settings.paymentMethods.length && {
      paymentAccepted: settings.paymentMethods.join(", "),
    }),
    ...(sameAs.length && { sameAs }),
  };
}

/** Schema.org — sitio con acción de búsqueda */
export function websiteSchema(name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name,
    inLanguage: LANGUAGE,
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tienda?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Schema.org — producto con su oferta y envío.
 *
 * La marca, la moneda y el costo de envío salen de la configuración: si el
 * domicilio no está definido en el panel, el bloque de envío no se declara en
 * vez de anunciar una tarifa inventada.
 *
 * No declara opiniones: no existe una fuente real de reseñas. `aggregateRating`
 * solo entra si la ficha tiene un conteo de verdad detrás.
 */
export function productSchema(product: Product, settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/producto/${product.slug}#product`,
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((i) => `${SITE_URL}${i}`),
    brand: { "@type": "Brand", name: storeLabel(settings) },
    category: product.category,
    ...(product.reviewsCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewsCount,
        bestRating: 5,
      },
    }),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: CURRENCY,
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}#organization` },
      ...(settings.shippingPrice > 0 && {
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: settings.shippingPrice,
            currency: CURRENCY,
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: COUNTRY_CODE,
          },
        },
      }),
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: COUNTRY_CODE,
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
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

/** Schema.org — preguntas frecuentes. Solo las que existan de verdad. */
export function faqSchema(faqs: { q: string; a: string }[]) {
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
      url: `${SITE_URL}/producto/${p.slug}`,
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
