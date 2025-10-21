import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Your production domain (update this)
const DOMAIN = 'https://nirchal.com';

// Static pages with their priority and change frequency
const STATIC_PAGES = [
  { path: '/', priority: 1.0, changefreq: 'daily' }, // Homepage
  { path: '/products', priority: 0.9, changefreq: 'daily' }, // All products
  { path: '/categories', priority: 0.9, changefreq: 'weekly' }, // Categories listing
  { path: '/about', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/faq', priority: 0.5, changefreq: 'monthly' },
  { path: '/size-guide', priority: 0.5, changefreq: 'monthly' },
  { path: '/shipping', priority: 0.5, changefreq: 'monthly' },
  { path: '/return-policy', priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { path: '/terms', priority: 0.4, changefreq: 'yearly' },
];

/**
 * Format date to W3C format (YYYY-MM-DD)
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Generate sitemap XML
 */
async function generateSitemap() {
  try {
    console.log('🚀 Generating sitemap...');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    console.log('📄 Adding static pages...');
    for (const page of STATIC_PAGES) {
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}${page.path}</loc>\n`;
      xml += `    <lastmod>${formatDate(new Date())}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Fetch and add all active products
    console.log('🛍️  Fetching products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else if (products) {
      console.log(`✅ Adding ${products.length} products...`);
      for (const product of products) {
        xml += '  <url>\n';
        xml += `    <loc>${DOMAIN}/products/${product.slug}</loc>\n`;
        xml += `    <lastmod>${formatDate(new Date(product.updated_at || Date.now()))}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += '  </url>\n';
      }
    }

    // Fetch and add all categories
    console.log('📁 Fetching categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else if (categories) {
      console.log(`✅ Adding ${categories.length} categories...`);
      for (const category of categories) {
        xml += '  <url>\n';
        xml += `    <loc>${DOMAIN}/category/${category.slug}</loc>\n`;
        xml += `    <lastmod>${formatDate(new Date(category.updated_at || Date.now()))}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    // Write sitemap to public directory
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(sitemapPath, xml, 'utf-8');

    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${STATIC_PAGES.length + (products?.length || 0) + (categories?.length || 0)}`);
    console.log(`\n🌐 Submit to: ${DOMAIN}/sitemap.xml`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
