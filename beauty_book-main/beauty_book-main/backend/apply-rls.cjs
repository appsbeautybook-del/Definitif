require('dotenv').config();
const pg = require('pg');
const fs = require('fs');
const sql = fs.readFileSync('../supabase/migrations/20250708_rls_all_admin_tables.sql', 'utf8');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: false });
client.connect()
  .then(() => client.query(sql))
  .then(r => { console.log('Migration applied successfully'); client.end(); })
  .catch(e => { console.error('Error:', e.message); client.end(); });
