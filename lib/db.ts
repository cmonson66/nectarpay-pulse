import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type PulseLead = {
  place_id: string;
  pulse_token: string;
  name: string;
  city: string | null;
  vertical: string;
  band: string;
  status: string;
  phone: string | null;
  owner_first_name: string | null;
  latitude: number | null;
  longitude: number | null;
  self_reported_monthly_volume: number | null;
  self_reported_crypto_volume: number | null;
};
