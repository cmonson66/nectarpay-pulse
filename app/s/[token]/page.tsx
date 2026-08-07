import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { serviceClient, type PulseLead } from '@/lib/db';
import { clusterFor, CLUSTER_COPY } from '@/lib/clusters';
import { PulseClient } from './pulse-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your shop · NectarPay AZ',
  robots: { index: false, follow: false },
};

export default async function PulsePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { token } = await params;
  const { i: intent } = await searchParams;

  if (!/^[a-f0-9]{16}$/.test(token)) notFound();

  const supabase = serviceClient();
  const { data: lead } = await supabase
    .from('nectarpay_leads')
    .select(
      'place_id, pulse_token, name, city, vertical, band, status, phone, owner_first_name, latitude, longitude, self_reported_monthly_volume, self_reported_crypto_volume'
    )
    .eq('pulse_token', token)
    .single<PulseLead>();

  if (!lead) notFound();

  // Soft view log (scanner-safe: views never touch status or activities)
  await supabase.from('engagement_events').insert({
    pulse_token: token,
    event: 'view',
    intent: intent?.slice(0, 40) ?? null,
  });

  // Density: businesses on our list within ~1 mile (bounding box approx)
  let nearby = 0;
  if (lead.latitude != null && lead.longitude != null) {
    const dLat = 0.0145;
    const dLng = 0.0145 / Math.max(0.2, Math.cos((lead.latitude * Math.PI) / 180));
    const { count } = await supabase
      .from('nectarpay_leads')
      .select('place_id', { count: 'exact', head: true })
      .gte('latitude', lead.latitude - dLat)
      .lte('latitude', lead.latitude + dLat)
      .gte('longitude', lead.longitude - dLng)
      .lte('longitude', lead.longitude + dLng);
    nearby = Math.max(0, (count ?? 1) - 1);
  }

  const cluster = clusterFor(lead.vertical);
  const copy = CLUSTER_COPY[cluster];
  const city = lead.city?.replace(/\s+AZ$/, '') ?? 'Arizona';

  // The lead's CRM owner decides whose name and cell the card shows
  let repFirst = 'Eric';
  let repCell = '602-550-9162';
  const { data: reps } = await supabase
    .from('reps')
    .select('profile_id, first_name, cell, is_default')
    .eq('active', true);
  if (reps && reps.length > 0) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('owner_id')
      .eq('legacy_id', lead.place_id)
      .not('owner_id', 'is', null)
      .maybeSingle();
    const owned = contact?.owner_id
      ? reps.find((r) => r.profile_id === contact.owner_id)
      : null;
    const chosen = owned ?? reps.find((r) => r.is_default) ?? null;
    if (chosen) {
      repFirst = chosen.first_name;
      repCell = chosen.cell ?? repCell;
    }
  }

  return (
    <PulseClient
      token={token}
      businessName={lead.name}
      ownerFirst={lead.owner_first_name}
      city={city}
      sub={copy.sub}
      pain={copy.pain}
      nearby={nearby}
      initialVolume={lead.self_reported_monthly_volume ?? 10000}
      initialCrypto={lead.self_reported_crypto_volume ?? 3000}
      repFirst={repFirst}
      repCell={repCell}
      emailIntent={intent ?? null}
    />
  );
}
