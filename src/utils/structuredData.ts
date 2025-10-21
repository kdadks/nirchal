/**
 * Structured Data (JSON-LD) utilities for SEO
 * Generate schema.org markup for products, breadcrumbs, FAQs, etc.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  sku?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: {
    value: number;
    count: number;
  };
  slug: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate Product structured data (JSON-LD)
 * https://schema.org/Product
 */
export function generateProductSchema(product: Product, baseUrl: string) {
  const schema: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`,
    'sku': product.sku || product.id,
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'Nirchal'
    },
    'offers': {
      '@type': 'Offer',
      'url': `${baseUrl}/products/${product.slug}`,
      'priceCurrency': product.currency,
      'price': product.price,
      'availability': `https://schema.org/${product.availability || 'InStock'}`,
      'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    }
  };

  // Add aggregateRating if available
  if (product.rating && product.rating.count > 0) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': product.rating.value,
      'reviewCount': product.rating.count,
      'bestRating': 5,
      'worstRating': 1
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 * https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generate FAQPage structured data (JSON-LD)
 * https://schema.org/FAQPage
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Generate Organization structured data (JSON-LD)
 * https://schema.org/Organization
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    'name': 'Nirchal',
    'url': baseUrl,
    'logo': `${baseUrl}/logo.png`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'email': 'support@nirchal.com'
    },
    'sameAs': [
      // Add your social media URLs here
      // 'https://www.facebook.com/nirchal',
      // 'https://www.instagram.com/nirchal',
      // 'https://twitter.com/nirchal',
    ]
  };
}

/**
 * Generate Website structured data (JSON-LD)
 * https://schema.org/WebSite
 */
export function generateWebsiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    'name': 'Nirchal',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${baseUrl}/products?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Render JSON-LD script tag
 * Usage: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(schema) }} />
 */
export function renderJsonLd(schema: any): string {
  return JSON.stringify(schema);
}
