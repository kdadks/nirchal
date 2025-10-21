import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  productData?: {
    price?: number;
    currency?: string;
    availability?: string;
    brand?: string;
  };
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * SEO Component for managing meta tags, canonical URLs, and Open Graph data
 * Usage: <SEO title="Product Name" description="..." canonical="/products/slug" />
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  keywords,
  ogType = 'website',
  ogImage,
  productData,
  noindex = false,
  nofollow = false,
}) => {
  const siteName = 'Nirchal';
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://nirchal.com';
  
  // Build full canonical URL
  const canonicalUrl = canonical 
    ? `${baseUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : undefined;

  // Build full OG image URL
  const ogImageUrl = ogImage 
    ? ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`
    : `${baseUrl}/images/og-default.jpg`;

  // Build robots meta tag
  let robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  const robotsTag = robotsContent.length > 0 
    ? robotsContent.join(',') 
    : 'index,follow';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title} | {siteName}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsTag} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={`${title} | ${siteName}`} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImageUrl} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${siteName}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Product-Specific Meta Tags */}
      {productData && (
        <>
          {productData.price && productData.currency && (
            <>
              <meta property="product:price:amount" content={productData.price.toString()} />
              <meta property="product:price:currency" content={productData.currency} />
            </>
          )}
          {productData.availability && (
            <meta property="product:availability" content={productData.availability} />
          )}
          {productData.brand && (
            <meta property="product:brand" content={productData.brand} />
          )}
        </>
      )}
    </Helmet>
  );
};

export default SEO;
