import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pgPool.on('error', (err) => {
  console.error('pg pool error (idle client):', err.message);
});

pgPool.connect().then(() => console.log('✅ pg pool connected')).catch(e => console.error('pg pool connect error:', e.message));

const pgClient = {
  async query(text, params) {
    return pgPool.query(text, params);
  },
};

export default pgClient;
