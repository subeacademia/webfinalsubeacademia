export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(params: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name,
    url: params.url,
    logo: params.logo,
    sameAs: params.sameAs ?? [],
  };
}

export function articleJsonLd(params: {
  headline: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url?: string;
  scholarly?: boolean;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': params.scholarly ? 'ScholarlyArticle' : 'Article',
    headline: params.headline,
    image: params.image,
    description: params.description,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    author: params.authorName ? { '@type': 'Person', name: params.authorName } : undefined,
    mainEntityOfPage: params.url,
  };
}

export function courseJsonLd(params: {
  name: string;
  description?: string;
  providerName?: string;
  url?: string;
  inLanguage?: string;
  offers?: { price: number; priceCurrency?: string };
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: params.name,
    description: params.description,
    provider: params.providerName
      ? { '@type': 'Organization', name: params.providerName }
      : undefined,
    url: params.url,
    inLanguage: params.inLanguage,
    offers: params.offers
      ? {
          '@type': 'Offer',
          price: params.offers.price,
          priceCurrency: params.offers.priceCurrency ?? 'USD',
        }
      : undefined,
  };
}

