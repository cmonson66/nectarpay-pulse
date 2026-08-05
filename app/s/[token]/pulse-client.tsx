'use client';

import { useMemo, useRef, useState } from 'react';
import { INTENT_LABELS } from '@/lib/clusters';

const YEAR_ONE = 727;
const ONGOING = 228;
const CARD_RATE = 0.029;

type Props = {
  token: string;
  businessName: string;
  ownerFirst: string | null;
  city: string;
  sub: string;
  pain: string;
  nearby: number;
  initialVolume: number;
  emailIntent: string | null;
};

async function logEvent(
  token: string,
  event: string,
  extra: { intent?: string; valueText?: string; valueNum?: number } = {}
) {
  try {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, event, ...extra }),
    });
  } catch {
    // Best-effort — the page never breaks over telemetry
  }
}

const money = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US');

export function PulseClient(props: Props) {
  const { token } = props;
  const [volume, setVolume] = useState(props.initialVolume);
  const [tappedIntent, setTappedIntent] = useState<string | null>(null);
  const [visitDay, setVisitDay] = useState<string | null>(null);
  const [visitDone, setVisitDone] = useState(false);
  const [phone, setPhone] = useState('');
  const [textDone, setTextDone] = useState(false);
  const [optedOut, setOptedOut] = useState(false);
  const [confirmOptOut, setConfirmOptOut] = useState(false);
  const sliderLogged = useRef<number | null>(null);

  const yearlyFees = useMemo(() => volume * 12 * CARD_RATE, [volume]);
  const kept = Math.max(0, yearlyFees - YEAR_ONE);
  const feePct = Math.min(100, (yearlyFees / (yearlyFees + 1) > 0 ? (yearlyFees / 6000) * 100 : 0));

  const commitSlider = () => {
    if (sliderLogged.current === volume) return;
    sliderLogged.current = volume;
    logEvent(token, 'slider', { valueNum: volume });
  };

  const tapIntent = (key: string) => {
    setTappedIntent(key);
    logEvent(token, 'intent', { intent: key });
  };

  const requestVisit = (day: string) => {
    setVisitDay(day);
    setVisitDone(true);
    logEvent(token, 'visit_request', { valueText: day });
  };

  const requestText = () => {
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.length < 10) return;
    setTextDone(true);
    logEvent(token, 'text_request', { valueText: cleaned });
  };

  const optOut = () => {
    setOptedOut(true);
    logEvent(token, 'optout');
  };

  if (optedOut) {
    return (
      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">NectarPay · Arizona</p>
          <h1 className="display">Understood.</h1>
          <p className="sub">
            {props.businessName} is off our list — no more emails, no visits. If the
            payments world ever changes on you, you know where we are.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap">
      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <p className="eyebrow">Built for</p>
        <h1 className="display">{props.businessName}</h1>
        <p className="sub">
          {props.ownerFirst ? `${props.ownerFirst} — ` : ''}
          {props.sub}
        </p>
        <div className="intentRow" role="group" aria-label="What's hitting home?">
          {Object.entries(INTENT_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`chip ${tappedIntent === key || (!tappedIntent && props.emailIntent === key) ? 'chipOn' : ''}`}
              onClick={() => tapIntent(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {tappedIntent && (
          <p className="chipEcho">Noted — Eric leads with that if you two ever talk.</p>
        )}
      </section>

      {/* ---------------- THE NAPKIN ---------------- */}
      <section className="napkin card">
        <p className="cardKicker">The napkin math</p>
        <h2 className="cardTitle">Slide your monthly card sales</h2>

        <div className="bigMoney" aria-live="polite">
          <span className="bigNum">{money(volume)}</span>
          <span className="bigLabel">/ month on cards</span>
        </div>

        <input
          className="slider"
          type="range"
          min={2000}
          max={60000}
          step={1000}
          value={volume}
          aria-label="Monthly card sales"
          onChange={(e) => setVolume(Number(e.target.value))}
          onPointerUp={commitSlider}
          onKeyUp={commitSlider}
          onTouchEnd={commitSlider}
        />

        <div className="meter" aria-hidden="true">
          <div className="meterFill" style={{ width: `${feePct}%` }} />
        </div>

        <div className="mathRows">
          <div className="mathRow loss">
            <span>Lost to card fees per year (~2.9%)</span>
            <strong>−{money(yearlyFees)}</strong>
          </div>
          <div className="mathRow">
            <span>NectarPay, year one — all in</span>
            <strong>{money(YEAR_ONE)}</strong>
          </div>
          <div className="mathRow">
            <span>Every year after</span>
            <strong>{money(ONGOING)}</strong>
          </div>
          <div className="mathRow keep">
            <span>Stays in the shop, year one*</span>
            <strong>+{money(kept)}</strong>
          </div>
        </div>
        <p className="fine">
          *If your crypto-paying customers cover volume like this. Cards keep working
          exactly as they do now — this is the no-fee lane beside them. 0% processing
          on crypto, money settles to your own wallet in seconds, no chargebacks.
        </p>
      </section>

      {/* ---------------- DENSITY ---------------- */}
      {props.nearby >= 3 && (
        <section className="density">
          <span className="densityNum">{props.nearby}</span>
          <span className="densityText">
            businesses within a mile of you are on our {props.city} list this month.
            The block moves together.
          </span>
        </section>
      )}

      {/* ---------------- EXITS ---------------- */}
      <section className="exits">
        <div className="card exit">
          <h3 className="exitTitle">Have Eric stop by</h3>
          <p className="exitSub">
            Ten minutes at your counter, live demo on the real terminal. Pick a day —
            he confirms by text.
          </p>
          {visitDone ? (
            <p className="done">
              Locked in — Eric will text to confirm {visitDay}. Nothing else to do.
            </p>
          ) : (
            <div className="dayRow">
              {['Tuesday', 'Wednesday', 'Thursday'].map((d) => (
                <button key={d} type="button" className="dayBtn" onClick={() => requestVisit(d)}>
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card exit">
          <h3 className="exitTitle">Text me the one-pager</h3>
          <p className="exitSub">The whole thing on one page — pricing included.</p>
          {textDone ? (
            <p className="done">On its way from Eric (602-550-9162). Save the number.</p>
          ) : (
            <div className="textRow">
              <input
                className="phoneInput"
                type="tel"
                inputMode="tel"
                placeholder="Your cell"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Your cell number"
              />
              <button type="button" className="dayBtn" onClick={requestText}>
                Send it
              </button>
            </div>
          )}
        </div>

        <div className="exitQuiet">
          {confirmOptOut ? (
            <span>
              Sure?{' '}
              <button type="button" className="quietLink" onClick={optOut}>
                Yes — take us off the list
              </button>{' '}
              <button type="button" className="quietLink" onClick={() => setConfirmOptOut(false)}>
                No, keep us on
              </button>
            </span>
          ) : (
            <button type="button" className="quietLink" onClick={() => setConfirmOptOut(true)}>
              Not for us — stop emailing
            </button>
          )}
        </div>
      </section>

      <footer className="foot">
        <span className="footBrand">
          Nectar<span className="footAccent">Pay</span> · Arizona
        </span>
        <span>Eric · NectarPay Ambassador, Phoenix</span>
      </footer>
    </main>
  );
}
