import { NextRequest, NextResponse } from 'next/server';
import { serviceClient } from '@/lib/db';

const EVENTS = new Set(['intent', 'slider', 'visit_request', 'text_request', 'optout']);

export async function POST(req: NextRequest) {
  let body: {
    token?: string;
    event?: string;
    intent?: string;
    valueText?: string;
    valueNum?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }

  const token = (body.token ?? '').trim();
  const event = (body.event ?? '').trim();
  if (!/^[a-f0-9]{16}$/.test(token) || !EVENTS.has(event)) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }

  const supabase = serviceClient();
  const { error } = await supabase.from('engagement_events').insert({
    pulse_token: token,
    event,
    intent: body.intent?.slice(0, 40) ?? null,
    value_text: body.valueText?.slice(0, 120) ?? null,
    value_num: typeof body.valueNum === 'number' && isFinite(body.valueNum) ? body.valueNum : null,
    user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
  });

  if (error) {
    console.error('event insert failed:', error.message);
    return NextResponse.json({ ok: false, error: 'Storage failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
