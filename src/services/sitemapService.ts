import { supabase } from '../config/supabase';

const DOMAIN = 'https://nirchal.com';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

interface Category {
  id: unknown;
  slug: unknown;
  updated_at: unknown;
}

// Static pages with their priority and change frequency
const STATIC_PAGES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/products', priority: 0.9, changefreq: 'daily' },
  { path: '/categories', priority: 0.9, changefreq: 'weekly' },
  { path: '/about', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/faq', priority: 0.5, changefreq: 'monthly' },
  { path: '/size-guide', priority: 0.5, changefreq: 'monthly' },
  { path: '/shipping', priority: 0.5, changefreq: 'monthly' },
  { path: '/return-policy', priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { path: '/terms', priority: 0.4, changefreq: 'yearly' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateXmlUrl(url: SitemapUrl): string {
  let xml = `  <url>\n    <loc>${url.loc}</loc>\n`;
  if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
  if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
  if (url.priority !== undefined) xml += `    <priority>${url.priority}</priority>\n`;
  xml += `  </url>\n`;
  return xml;
}

export async function generateSitemap(): Promise<{ success: boolean; message: string; urlCount?: number; xml?: string }> {
  try {
    const urls: SitemapUrl[] = [];
    const today = formatDate(new Date());

    // Add static pages
    STATIC_PAGES.forEach(page => {
      urls.push({
        loc: `${DOMAIN}${page.path}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug, updated_at')
      .eq('is_active', true)
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else if (categories) {
      categories.forEach((category: Category) => {
        urls.push({
          loc: `${DOMAIN}/category/${String(category.slug)}`,
          lastmod: category.updated_at && typeof category.updated_at === 'string' 
            ? formatDate(new Date(category.updated_at)) 
            : today,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
    }

    // Fetch all active products with their variants
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, 
        slug, 
        updated_at,
        product_variants(
          id,
          color,
          size
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else if (products) {
      products.forEach((product: any) => {
        const baseUrl = `${DOMAIN}/products/${String(product.slug)}`;
        const lastmod = product.updated_at && typeof product.updated_at === 'string'
          ? formatDate(new Date(product.updated_at))
          : today;

        // Add base product URL
        urls.push({
          loc: baseUrl,
          lastmod,
          changefreq: 'weekly',
          priority: 0.7,
        });

        // Add variant URLs if product has variants
        if (product.product_variants && Array.isArray(product.product_variants) && product.product_variants.length > 0) {
          // Group variants by color-size combinations to avoid duplicates
          const variantCombinations = new Set<string>();
          
          product.product_variants.forEach((variant: any) => {
            const params = new URLSearchParams();
            if (variant.color) params.set('color', variant.color);
            if (variant.size) params.set('size', variant.size);
            
            const paramsString = params.toString();
            if (paramsString && !variantCombinations.has(paramsString)) {
              variantCombinations.add(paramsString);
              
              urls.push({
                loc: `${baseUrl}?${paramsString}`,
                lastmod,
                changefreq: 'weekly',
                priority: 0.65, // Slightly lower priority than base product
              });
            }
          });
        }
      });
    }

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    urls.forEach(url => {
      xml += generateXmlUrl(url);
    });
    xml += '</urlset>';

    // Store generation metadata in database
    await supabase
      .from('settings')
      .upsert({
        category: 'seo',
        key: 'last_sitemap_generation',
        value: new Date().toISOString(),
      }, {
        onConflict: 'category,key'
      });

    await supabase
      .from('settings')
      .upsert({
        category: 'seo',
        key: 'sitemap_url_count',
        value: urls.length.toString(),
      }, {
        onConflict: 'category,key'
      });

    return {
      success: true,
      message: `Sitemap generated successfully with ${urls.length} URLs`,
      urlCount: urls.length,
      xml: xml,
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate sitemap',
    };
  }
}

export async function getSitemapMetadata(): Promise<{
  lastGeneration: string | null;
  urlCount: number | null;
}> {
  try {
    const { data: lastGenData, error: lastGenError } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'seo')
      .eq('key', 'last_sitemap_generation')
      .maybeSingle();

    if (lastGenError) {
      console.error('Error fetching last sitemap generation:', lastGenError);
    }

    const { data: urlCountData, error: urlCountError } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'seo')
      .eq('key', 'sitemap_url_count')
      .maybeSingle();

    if (urlCountError) {
      console.error('Error fetching sitemap URL count:', urlCountError);
    }

    return {
      lastGeneration: lastGenData?.value && typeof lastGenData.value === 'string' ? lastGenData.value : null,
      urlCount: urlCountData?.value && typeof urlCountData.value === 'string' ? parseInt(urlCountData.value) : null,
    };
  } catch (error) {
    console.error('Error fetching sitemap metadata:', error);
    return {
      lastGeneration: null,
      urlCount: null,
    };
  }
}
