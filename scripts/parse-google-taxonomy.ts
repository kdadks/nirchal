/**
 * Parse Google Product Taxonomy and generate SQL insert statements
 * Source: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 * Version: 2021-09-21
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the downloaded taxonomy file
const TAXONOMY_FILE = path.join(__dirname, 'google-taxonomy.txt');
const OUTPUT_FILE = path.join(__dirname, '../supabase/migrations/20241106_google_product_taxonomy_data.sql');

interface TaxonomyEntry {
  id: number;
  categoryName: string;
  fullPath: string;
  level: number;
  parentId: number | null;
}

/**
 * Parse the taxonomy text file
 */
function parseTaxonomy(content: string): TaxonomyEntry[] {
  const lines = content.split('\n');
  const entries: TaxonomyEntry[] = [];
  const categoryMap = new Map<string, number>();

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    // Parse line format: "ID - Full > Category > Path"
    const match = line.match(/^(\d+)\s*-\s*(.+)$/);
    if (!match) {
      continue;
    }

    const id = parseInt(match[1], 10);
    const fullPath = match[2].trim();
    
    // Split path into parts
    const parts = fullPath.split('>').map(p => p.trim());
    const level = parts.length;
    const categoryName = parts[parts.length - 1];

    // Determine parent ID
    let parentId: number | null = null;
    if (level > 1) {
      const parentPath = parts.slice(0, -1).join(' > ');
      parentId = categoryMap.get(parentPath) || null;
    }

    // Store this entry
    categoryMap.set(fullPath, id);
    entries.push({
      id,
      categoryName,
      fullPath,
      level,
      parentId
    });
  }

  return entries;
}

/**
 * Generate SQL insert statements
 */
function generateSQL(entries: TaxonomyEntry[]): string {
  let sql = `-- Google Product Taxonomy Data Insert
-- Generated on ${new Date().toISOString()}
-- Total categories: ${entries.length}

BEGIN;

`;

  // Generate inserts in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    
    sql += `INSERT INTO google_product_categories (id, category_name, full_path, level, parent_id) VALUES\n`;
    
    const values = batch.map(entry => {
      const escapedName = entry.categoryName.replace(/'/g, "''");
      const escapedPath = entry.fullPath.replace(/'/g, "''");
      const parentValue = entry.parentId !== null ? entry.parentId : 'NULL';
      return `  (${entry.id}, '${escapedName}', '${escapedPath}', ${entry.level}, ${parentValue})`;
    });
    
    sql += values.join(',\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET 
  category_name = EXCLUDED.category_name,
  full_path = EXCLUDED.full_path,
  level = EXCLUDED.level,
  parent_id = EXCLUDED.parent_id,
  updated_at = CURRENT_TIMESTAMP;\n\n`;
  }

  sql += `COMMIT;

-- Create a helper function to search categories
CREATE OR REPLACE FUNCTION search_google_categories(search_term TEXT)
RETURNS TABLE (
  id INTEGER,
  category_name TEXT,
  full_path TEXT,
  level INTEGER,
  parent_id INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gpc.id,
    gpc.category_name,
    gpc.full_path,
    gpc.level,
    gpc.parent_id
  FROM google_product_categories gpc
  WHERE 
    gpc.full_path ILIKE '%' || search_term || '%' OR
    gpc.category_name ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE 
      WHEN gpc.category_name ILIKE search_term || '%' THEN 1
      WHEN gpc.category_name ILIKE '%' || search_term || '%' THEN 2
      ELSE 3
    END,
    gpc.level,
    gpc.category_name
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Create a helper function to get category breadcrumb
CREATE OR REPLACE FUNCTION get_category_breadcrumb(category_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT full_path INTO result
  FROM google_product_categories
  WHERE id = category_id;
  
  RETURN COALESCE(result, '');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_google_categories IS 'Search Google product categories by name or path';
COMMENT ON FUNCTION get_category_breadcrumb IS 'Get the full breadcrumb path for a category';
`;

  return sql;
}

/**
 * Download taxonomy file if it doesn't exist
 */
async function downloadTaxonomy(): Promise<string> {
  if (fs.existsSync(TAXONOMY_FILE)) {
    console.log('Using existing taxonomy file...');
    return fs.readFileSync(TAXONOMY_FILE, 'utf-8');
  }

  console.log('Downloading taxonomy from Google...');
  const url = 'https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt';
  
  const response = await fetch(url);
  const content = await response.text();
  
  fs.writeFileSync(TAXONOMY_FILE, content, 'utf-8');
  console.log('Downloaded taxonomy file');
  
  return content;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting Google Product Taxonomy parser...');
    
    // Download or read taxonomy file
    const content = await downloadTaxonomy();
    
    console.log('Parsing taxonomy...');
    const entries = parseTaxonomy(content);
    console.log(`Parsed ${entries.length} categories`);
    
    // Generate SQL
    console.log('Generating SQL...');
    const sql = generateSQL(entries);
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, sql, 'utf-8');
    console.log(`SQL file generated: ${OUTPUT_FILE}`);
    
    // Print statistics
    const levels = entries.reduce((acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    console.log('\nStatistics:');
    console.log(`- Total categories: ${entries.length}`);
    console.log(`- Level distribution:`);
    Object.keys(levels).sort().forEach(level => {
      console.log(`  Level ${level}: ${levels[parseInt(level)]} categories`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
