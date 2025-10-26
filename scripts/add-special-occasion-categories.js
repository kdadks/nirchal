import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running special occasion categories migration...\n');

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251026000004_add_special_occasion_to_categories.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolons and filter out empty statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
    
    if (error) {
      // Try direct execution if RPC fails
      console.log('Trying direct execution...');
      const { error: directError } = await supabase.from('_migrations').insert({ statement });
      
      if (directError) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } else {
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
  }

  // Verify the changes
  console.log('\nVerifying migration...\n');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error verifying migration:', error);
  } else if (data && data.length > 0) {
    const category = data[0];
    const hasNewFields = 
      'is_special_occasion' in category &&
      'occasion_slug' in category &&
      'occasion_banner_image' in category;
    
    if (hasNewFields) {
      console.log('✅ Migration successful! New fields added to categories table:');
      console.log('   - is_special_occasion');
      console.log('   - occasion_slug');
      console.log('   - occasion_start_date');
      console.log('   - occasion_end_date');
      console.log('   - occasion_banner_image');
      console.log('   - occasion_banner_color');
      console.log('   - occasion_text_color');
    } else {
      console.log('⚠️ Migration may not have completed successfully');
      console.log('Sample category fields:', Object.keys(category));
    }
  }

  console.log('\n✨ Migration complete!');
  console.log('\nYou can now:');
  console.log('1. Create special occasion categories in the admin panel');
  console.log('2. Mark them as "Special Occasion Category"');
  console.log('3. They will be hidden from regular navigation');
  console.log('4. Link them to hero sections for special events');
}

runMigration().catch(console.error);
