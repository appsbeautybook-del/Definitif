import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.grlinrqxctmiegaluupi:Milliard%402025.@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
try {
  const tables = ['ProfilPro','Service','Reservation','MembreEquipe','Avis','Style','VisiteVirtuelle','CatalogueOption','Produit'];
  const r = await pool.query(`
    SELECT tablename, policyname, cmd, qual, with_check
    FROM pg_policies WHERE schemaname = 'public' AND tablename IN (${tables.map(t => "'" + t + "'").join(',')})
    ORDER BY tablename, policyname
  `);
  for (const row of r.rows) {
    console.log('\n' + row.tablename + ' / ' + row.policyname + ' [' + row.cmd + ']');
    if (row.qual) console.log('  WHERE: ' + row.qual);
    if (row.with_check) console.log('  CHECK: ' + row.with_check);
  }
} catch(e) { console.error(e.message); }
await pool.end();
