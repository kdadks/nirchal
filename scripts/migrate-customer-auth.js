import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vhlvgjtpzjkhejdsqbzk.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZobHZnanRwempoaGVqZHNxYnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4ODA1NTEsImV4cCI6MjA0NzQ1NjU1MX0.r65cJnmJ0MPJ_2ZXB_tIHPLKmKF-CpW8-Xd7DG8P2YI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('Running customer authentication migration...');
    
    const migrationSQL = readFileSync(join(__dirname, '..', 'src', 'db', 'add_customer_auth.sql'), 'utf8');
    
    // Split by semicolons and execute each statement separately
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.error('Error executing statement:', error);
          // Continue with other statements
        }
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
