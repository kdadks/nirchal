/**
 * Structured Data (JSON-LD) utilities for SEO
 * Generate schema.org markup for products, breadcrumbs, FAQs, etc.
 */

export interface Review {
  author: string;
  rating: number;
  comment: string;
  datePublished: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  sku?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  images?: string[]; // Multiple images for Google Merchant Center
  sku?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: {
    value: number;
    count: number;
  };
  slug: string;
  // Additional GMC fields
  color?: string;
  colors?: string[];
  material?: string;
  category?: string;
  gtin?: string; // Global Trade Item Number (UPC/EAN/ISBN)
  mpn?: string; // Manufacturer Part Number
  condition?: 'NewCondition' | 'RefurbishedCondition' | 'UsedCondition';
  gender?: 'Female' | 'Male' | 'Unisex';
  ageGroup?: 'Adult' | 'Kids' | 'Infant' | 'Toddler' | 'Newborn';
  reviews?: Review[]; // Customer reviews
  variants?: ProductVariant[]; // Product variants
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
 * Enhanced for Google Merchant Center with all required attributes
 */
export function generateProductSchema(product: Product, baseUrl: string) {
  // Prepare images array
  const images: string[] = [];
  
  // Add primary image
  if (product.image) {
    images.push(product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`);
  }
  
  // Add additional images (up to 10 for GMC)
  if (product.images && product.images.length > 0) {
    product.images
      .filter(img => img !== product.image) // Avoid duplicate primary image
      .slice(0, 9) // GMC allows up to 10 additional images
      .forEach(img => {
        images.push(img.startsWith('http') ? img : `${baseUrl}${img}`);
      });
  }

  const schema: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'description': product.description || `${product.name} - Premium quality ${product.category || 'fashion'} available at Nirchal. Shop now for the best prices and fast delivery.`,
    'image': images.length > 0 ? images : undefined,
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
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': '0',
          'currency': product.currency
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'IN'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 1,
            'maxValue': 2,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 3,
            'maxValue': 7,
            'unitCode': 'DAY'
          }
        }
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'applicableCountry': 'IN',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 7,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/FreeReturn'
      }
    }
  };

  // Add GTIN (Global Trade Item Number) if available - strongly recommended by GMC
  if (product.gtin) {
    schema['gtin'] = product.gtin;
  }

  // Add MPN (Manufacturer Part Number) if available
  if (product.mpn) {
    schema['mpn'] = product.mpn;
  }

  // Add product condition (default to NewCondition for apparel)
  schema['itemCondition'] = `https://schema.org/${product.condition || 'NewCondition'}`;

  // Add category for Google product category
  if (product.category) {
    schema['category'] = product.category;
  }

  // Add color - important for apparel
  if (product.color) {
    schema['color'] = product.color;
  }

  // Add material - recommended for apparel
  if (product.material) {
    schema['material'] = product.material;
  }

  // Add gender - required for apparel in major markets
  if (product.gender) {
    schema['audience'] = {
      '@type': 'PeopleAudience',
      'suggestedGender': product.gender
    };
  }

  // Add age group - required for apparel in major markets
  if (product.ageGroup) {
    schema['audience'] = {
      ...schema['audience'],
      '@type': 'PeopleAudience',
      'suggestedMinAge': product.ageGroup === 'Infant' ? 0 : product.ageGroup === 'Kids' ? 5 : 18,
      'suggestedMaxAge': product.ageGroup === 'Infant' ? 4 : product.ageGroup === 'Kids' ? 17 : undefined
    };
  }

  // Add aggregateRating if available (always add, even if no reviews yet)
  if (product.rating && product.rating.count > 0) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': product.rating.value,
      'reviewCount': product.rating.count,
      'bestRating': 5,
      'worstRating': 1
    };
  } else {
    // Add default aggregateRating to avoid Google Search Console warnings
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': 5,
      'reviewCount': 0,
      'bestRating': 5,
      'worstRating': 1
    };
  }

  // Add review field (individual reviews)
  if (product.reviews && product.reviews.length > 0) {
    schema['review'] = product.reviews.map(review => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': review.author
      },
      'datePublished': review.datePublished,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': 5,
        'worstRating': 1
      },
      'reviewBody': review.comment
    }));
  }

  // Add hasVariant for products with variants
  if (product.variants && product.variants.length > 0) {
    const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    schema['hasVariant'] = product.variants.map(variant => ({
      '@type': 'Product',
      'name': `${product.name} - ${variant.name}`,
      'sku': variant.sku || `${product.sku || product.id}-${variant.name}`,
      'offers': {
        '@type': 'Offer',
        'url': `${baseUrl}/products/${product.slug}`,
        'priceCurrency': product.currency,
        'price': variant.price,
        'availability': `https://schema.org/${variant.availability || 'InStock'}`,
        'priceValidUntil': priceValidUntil
      }
    }));
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
