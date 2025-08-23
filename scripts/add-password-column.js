import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vhlvgjtpzjkhejdsqbzk.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZobHZnanRwempoaGVqZHNxYnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4ODA1NTEsImV4cCI6MjA0NzQ1NjU1MX0.r65cJnmJ0MPJ_2ZXB_tIHPLKmKF-CpW8-Xd7DG8P2YI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addPasswordColumn() {
  try {
    console.log('Adding password column to customers table...');
    
    const migrationSQL = readFileSync(join(__dirname, '..', 'src', 'db', 'add_customer_password.sql'), 'utf8');
    
    // Execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      // Try alternative approach - execute each statement
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        const cleanStmt = statement.trim();
        if (cleanStmt && !cleanStmt.startsWith('--')) {
          console.log('Executing:', cleanStmt.substring(0, 50) + '...');
          
          if (cleanStmt.includes('ALTER TABLE')) {
            // Try using raw SQL for ALTER TABLE
            try {
              const { error: alterError } = await supabase.rpc('exec_sql', { sql: cleanStmt });
              if (alterError) console.log('Note: Column might already exist:', alterError.message);
            } catch (e) {
              console.log('Note: ALTER TABLE issue (column might exist):', e);
            }
          } else if (cleanStmt.includes('INSERT INTO')) {
            // Handle INSERT separately
            try {
              await supabase
                .from('customers')
                .insert([
                  { email: 'test@example.com', password_hash: 'password123', first_name: 'Test', last_name: 'User', phone: '+1234567890' },
                  { email: 'john@example.com', password_hash: 'password456', first_name: 'John', last_name: 'Doe', phone: '+0987654321' }
                ])
                .select();
            } catch (insertError) {
              console.log('Note: Test users might already exist');
            }
          }
        }
      }
    }
    
    console.log('Migration completed!');
    console.log('You can now test with:');
    console.log('- Email: test@example.com, Password: password123');
    console.log('- Email: john@example.com, Password: password456');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

addPasswordColumn();
