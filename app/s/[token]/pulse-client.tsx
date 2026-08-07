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
  initialCrypto: number;
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
  const [crypto, setCrypto] = useState(props.initialCrypto);
  const [cryptoMode, setCryptoMode] = useState<'shift' | 'new'>('shift');
  const [tappedIntent, setTappedIntent] = useState<string | null>(null);
  const [visitDay, setVisitDay] = useState<string | null>(null);
  const [visitTime, setVisitTime] = useState<string | null>(null);
  const [visitDone, setVisitDone] = useState(false);
  const [phone, setPhone] = useState('');
  const [textDone, setTextDone] = useState(false);
  const [optedOut, setOptedOut] = useState(false);
  const [confirmOptOut, setConfirmOptOut] = useState(false);
  const sliderLogged = useRef<number | null>(null);
  const cryptoLogged = useRef<string | null>(null);

  const yearlyFees = useMemo(() => volume * 12 * CARD_RATE, [volume]);
  // Crypto mix: in 'shift' mode the crypto slice can't exceed card volume
  const cryptoClamped = cryptoMode === 'shift' ? Math.min(crypto, volume) : crypto;
  const cryptoFeesYr = cryptoClamped * 12 * CARD_RATE;
  const cryptoRevenueYr = cryptoClamped * 12;
  const kept = Math.max(0, yearlyFees - YEAR_ONE);
  const feePct = Math.min(100, (yearlyFees / (yearlyFees + 1) > 0 ? (yearlyFees / 6000) * 100 : 0));

  const commitSlider = () => {
    if (sliderLogged.current === volume) return;
    sliderLogged.current = volume;
    logEvent(token, 'slider', { valueNum: volume });
  };

  const commitCrypto = () => {
    const key = `${cryptoMode}:${cryptoClamped}`;
    if (cryptoLogged.current === key) return;
    cryptoLogged.current = key;
    logEvent(token, 'slider', { valueNum: cryptoClamped, valueText: `crypto:${cryptoMode}` });
  };

  const tapIntent = (key: string) => {
    setTappedIntent(key);
    logEvent(token, 'intent', { intent: key });
  };

  const requestVisit = (day: string, time: string) => {
    const pref = `${day} · ${time}`;
    setVisitDay(day);
    setVisitTime(time);
    setVisitDone(true);
    logEvent(token, 'visit_request', { valueText: pref });
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

        {/* ---------------- CRYPTO MIX ---------------- */}
        <div className="mixDivider" />
        <p className="cardKicker">Your crypto mix</p>
        <h2 className="cardTitle">Now say some of it is crypto</h2>

        <div className="modeRow" role="group" aria-label="How the crypto sales arrive">
          <button
            type="button"
            className={`modeBtn ${cryptoMode === 'shift' ? 'modeOn' : ''}`}
            onClick={() => setCryptoMode('shift')}
          >
            Moved off cards
          </button>
          <button
            type="button"
            className={`modeBtn ${cryptoMode === 'new' ? 'modeOn' : ''}`}
            onClick={() => setCryptoMode('new')}
          >
            New crypto customers
          </button>
        </div>

        <div className="bigMoney" aria-live="polite">
          <span className="bigNum">{money(cryptoClamped)}</span>
          <span className="bigLabel">
            / month in crypto{cryptoMode === 'shift' ? ' (instead of cards)' : ' (on top of cards)'}
          </span>
        </div>

        <input
          className="slider"
          type="range"
          min={0}
          max={cryptoMode === 'shift' ? Math.max(1000, volume) : 30000}
          step={500}
          value={cryptoClamped}
          aria-label="Monthly crypto sales"
          onChange={(e) => setCrypto(Number(e.target.value))}
          onPointerUp={commitCrypto}
          onKeyUp={commitCrypto}
          onTouchEnd={commitCrypto}
        />

        {cryptoMode === 'shift' ? (
          <div className="mathRows">
            <div className="mathRow">
              <span>Card fees skipped on that slice / yr</span>
              <strong className="posGreen">+{money(cryptoFeesYr)}</strong>
            </div>
            <div className="mathRow">
              <span>NectarPay, year one — all in</span>
              <strong>−{money(YEAR_ONE)}</strong>
            </div>
            <div className="mathRow keep">
              <span>Ahead in year one{cryptoFeesYr < YEAR_ONE ? '*' : ''}</span>
              <strong>{cryptoFeesYr - YEAR_ONE >= 0 ? '+' : '−'}{money(Math.abs(cryptoFeesYr - YEAR_ONE))}</strong>
            </div>
            <div className="mathRow">
              <span>Every year after, at this mix</span>
              <strong className="posGreen">+{money(Math.max(0, cryptoFeesYr - ONGOING))}</strong>
            </div>
          </div>
        ) : (
          <div className="mathRows">
            <div className="mathRow keep">
              <span>New revenue / yr</span>
              <strong>+{money(cryptoRevenueYr)}</strong>
            </div>
            <div className="mathRow">
              <span>Processing fees on it</span>
              <strong className="posGreen">$0 — ever</strong>
            </div>
            <div className="mathRow">
              <span>Fees you&rsquo;d have eaten if these were card sales</span>
              <strong className="posGreen">{money(cryptoFeesYr)} kept</strong>
            </div>
          </div>
        )}
        <p className="fine">
          {cryptoMode === 'shift'
            ? 'Every dollar a customer pays in crypto instead of a card skips the processing fee entirely.'
            : 'Crypto holders pick the shops that take it — every one of these sales settles to your wallet whole, in seconds.'}
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
              Locked in — Eric will text to confirm {visitDay}
              {visitTime ? ` ${visitTime.toLowerCase()}` : ''}. Nothing else to do.
            </p>
          ) : (
            <>
              <div className="dayRow">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`dayBtn ${visitDay === d ? 'dayOn' : ''}`}
                    onClick={() => setVisitDay(d)}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
              {visitDay && (
                <>
                  <p className="stepHint">{visitDay} — what part of the day?</p>
                  <div className="dayRow">
                    {['Morning', 'Afternoon', 'Evening'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="dayBtn"
                        onClick={() => requestVisit(visitDay, t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
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
