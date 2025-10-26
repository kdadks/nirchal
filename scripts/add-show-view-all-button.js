import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addShowViewAllButton() {
  console.log('Adding show_view_all_button field to featured_sections...\n');

  // Add the column
  const { error: addError } = await supabase.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE featured_sections 
      ADD COLUMN IF NOT EXISTS show_view_all_button BOOLEAN DEFAULT TRUE;
    `
  });

  if (addError) {
    console.error('Error adding column:', addError);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log('ALTER TABLE featured_sections ADD COLUMN IF NOT EXISTS show_view_all_button BOOLEAN DEFAULT TRUE;');
  } else {
    console.log('✅ Column added successfully');
  }

  // Verify the change
  console.log('\nVerifying migration...\n');
  
  const { data, error } = await supabase
    .from('featured_sections')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error verifying migration:', error);
  } else if (data && data.length > 0) {
    const section = data[0];
    if ('show_view_all_button' in section) {
      console.log('✅ Migration successful! Field "show_view_all_button" added to featured_sections table');
      console.log(`   Default value: ${section.show_view_all_button}`);
    } else {
      console.log('⚠️ Field may not have been added. Please check manually.');
    }
  }

  console.log('\n✨ Migration complete!');
  console.log('\nYou can now:');
  console.log('1. Edit featured sections in the admin panel');
  console.log('2. Uncheck "Show View All Products button" to hide it');
  console.log('3. The button will be hidden on the homepage for that section');
}

addShowViewAllButton().catch(console.error);
