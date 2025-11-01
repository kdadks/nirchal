import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addPasswordColumn() {
  try {
    
    
    const migrationSQL = readFileSync(join(__dirname, '..', 'src', 'db', 'add_customer_password.sql'), 'utf8');
    
    // Execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      
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
              if (alterError) {
                console.log('ALTER TABLE error:', alterError);
              }
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
              
            }
          }
        }
      }
    }
    
    
    
    
    
    
  } catch (error) {
    
  }
}

addPasswordColumn();
