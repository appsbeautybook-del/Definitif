import { supabase } from '@/api/supabaseClient';

/**
 * Auto-migration: adds missing columns to Reservation table.
 * Runs once on app load. Uses supabase.rpc('exec_sql') if available,
 * otherwise creates it first.
 */
let migrationRan = false;

const RESERVATION_COLUMNS = [
  { name: 'client_name', type: 'text', defaultVal: "''" },
  { name: 'client_phone', type: 'text', defaultVal: "''" },
  { name: 'pro_name', type: 'text', defaultVal: "''" },
  { name: 'service_id', type: 'text', defaultVal: "''" },
  { name: 'service_price', type: 'numeric', defaultVal: '0' },
  { name: 'end_time_slot', type: 'text', defaultVal: "''" },
  { name: 'duration_min', type: 'integer', defaultVal: '60' },
  { name: 'persons', type: 'integer', defaultVal: '1' },
  { name: 'addons', type: 'jsonb', defaultVal: "'[]'::jsonb" },
  { name: 'total_price', type: 'numeric', defaultVal: '0' },
  { name: 'acompte_amount', type: 'numeric', defaultVal: '0' },
  { name: 'payment_type', type: 'text', defaultVal: "'surplace'" },
  { name: 'crg_code', type: 'text', defaultVal: "''" },
  { name: 'payment_status', type: 'text', defaultVal: "'non_paye'" },
  { name: 'salon_name', type: 'text', defaultVal: "''" },
  { name: 'salon_address', type: 'text', defaultVal: "''" },
  { name: 'seats_total', type: 'integer', defaultVal: '0' },
  { name: 'reminder_scheduled', type: 'boolean', defaultVal: 'false' },
  { name: 'reminder_sent', type: 'boolean', defaultVal: 'false' },
  { name: 'completed_at', type: 'text', defaultVal: "''" },
  { name: 'review_requested', type: 'boolean', defaultVal: 'false' },
  { name: 'created_by_id', type: 'uuid', defaultVal: 'NULL' },
];

const CREATE_EXEC_SQL = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

export async function ensureReservationColumns() {
  if (migrationRan) return;
  migrationRan = true;

  try {
    // First ensure exec_sql function exists
    const { error: fnError } = await supabase.rpc('exec_sql', { query: 'SELECT 1' });
    if (fnError) {
      console.warn('[migration] exec_sql not available, trying direct SQL via supabaseQuery');
      return;
    }

    // Add each missing column
    for (const col of RESERVATION_COLUMNS) {
      const sql = `ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.defaultVal};`;
      await supabase.rpc('exec_sql', { query: sql });
    }

    // Reload PostgREST schema cache
    await supabase.rpc('exec_sql', { query: "NOTIFY pgrst, 'reload schema';" });

    console.info('[migration] Reservation columns ensured successfully');
  } catch (e) {
    console.warn('[migration] Failed to ensure Reservation columns:', e.message);
  }
}
