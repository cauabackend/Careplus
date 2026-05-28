// src/components/PandaMascot/PandaMascot.jsx
import { useEffect, useState, useId } from 'react';
import './PandaMascot.css';

const HEALTH_THEMES = {
  excellent: {
    accent: '#37C3FF',
    anim: 'panda-float 4s ease-in-out infinite',
    lids: false,
    zzz: false,
  },
  good: {
    accent: '#2DD75F',
    anim: 'panda-float 4s ease-in-out infinite',
    lids: false,
    zzz: false,
  },
  warning: {
    accent: '#FFA023',
    anim: 'panda-breathe 3s ease-in-out infinite',
    lids: true,
    zzz: false,
  },
  critical: {
    accent: '#FF3A3A',
    anim: '',
    lids: true,
    zzz: true,
  },
};

const EVENT_ANIMS = {
  mission_complete: 'panda-jump 0.6s ease-out',
  badge_earned:     'panda-spin 0.8s ease-in-out',
  friend_helped:    'panda-wave 1s ease-in-out',
  alert_triggered:  'panda-shake 0.5s ease-in-out',
  app_open:         'panda-bounce-in 1s cubic-bezier(.36,.07,.19,.97)',
};

const EVENT_DURATIONS = {
  mission_complete: 620,
  badge_earned:     820,
  friend_helped:    1020,
  alert_triggered:  520,
  app_open:         1020,
};

const SIZE_MAP = { sm: 120, md: 160, lg: 270 };

/**
 * Mascote Panda do CarePlus+.
 *
 * @param {('excellent'|'good'|'warning'|'critical')} healthState - Estado de saúde do dia
 * @param {('dashboard'|'missoes'|'chronicle'|'sentinel'|'chains'|'perfil')} pageContext - Contexto da página
 * @param {('mission_complete'|'badge_earned'|'friend_helped'|'alert_triggered'|'app_open'|null)} event - Evento one-shot
 * @param {('sm'|'md'|'lg')} size - Tamanho: sm=120px, md=160px, lg=270px
 */
export default function PandaMascot({
  healthState = 'good',
  pageContext = 'dashboard',
  event = null,
  size = 'md',
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const [activeEvent, setActiveEvent] = useState(null);
  const theme = HEALTH_THEMES[healthState] ?? HEALTH_THEMES.good;
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;

  useEffect(() => {
    if (!event) return;
    setActiveEvent(event);
    const t = setTimeout(
      () => setActiveEvent(null),
      EVENT_DURATIONS[event] ?? 1000
    );
    return () => clearTimeout(t);
  }, [event]);

  const currentAnim = activeEvent
    ? EVENT_ANIMS[activeEvent]
    : theme.anim || undefined;

  const ID = {
    gs:  `panda-gs-${uid}`,
    bd:  `panda-bd-${uid}`,
    hd:  `panda-hd-${uid}`,
    la:  `panda-la-${uid}`,
    ra:  `panda-ra-${uid}`,
    le:  `panda-le-${uid}`,
    re:  `panda-re-${uid}`,
    ll:  `panda-ll-${uid}`,
    rl:  `panda-rl-${uid}`,
    epL: `panda-epl-${uid}`,
    epR: `panda-epr-${uid}`,
    mz:  `panda-mz-${uid}`,
  };

  return (
    <div
      style={{
        display: 'inline-block',
        filter: 'drop-shadow(0 28px 52px rgba(0,0,20,.92))',
        animation: currentAnim,
      }}
    >
      <svg
        viewBox="0 0 300 448"
        width={px}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ '--accent': theme.accent }}
        aria-label="Panda mascote"
        role="img"
      >
        <defs>
          <radialGradient id={ID.gs} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(0,0,0,.55)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <clipPath id={ID.bd}>
            <rect x="54" y="212" width="192" height="182" rx="58" ry="54" />
          </clipPath>
          <clipPath id={ID.hd}>
            <circle cx="150" cy="112" r="94" />
          </clipPath>
          <clipPath id={ID.la}>
            <rect x="10" y="228" width="58" height="90" rx="28" transform="rotate(-12,39,273)" />
          </clipPath>
          <clipPath id={ID.ra}>
            <rect x="232" y="228" width="58" height="90" rx="28" transform="rotate(12,261,273)" />
          </clipPath>
          <clipPath id={ID.le}>
            <circle cx="68"  cy="40" r="26" />
          </clipPath>
          <clipPath id={ID.re}>
            <circle cx="232" cy="40" r="26" />
          </clipPath>
          <clipPath id={ID.ll}>
            <rect x="84"  y="368" width="60" height="52" rx="26" />
          </clipPath>
          <clipPath id={ID.rl}>
            <rect x="156" y="368" width="60" height="52" rx="26" />
          </clipPath>
          <clipPath id={ID.epL}>
            <ellipse cx="107" cy="118" rx="37" ry="31" transform="rotate(-8,107,118)" />
          </clipPath>
          <clipPath id={ID.epR}>
            <ellipse cx="193" cy="118" rx="37" ry="31" transform="rotate(8,193,118)" />
          </clipPath>
          <clipPath id={ID.mz}>
            <ellipse cx="150" cy="162" rx="34" ry="23" />
          </clipPath>
        </defs>

        {/* Sombra chão */}
        <ellipse cx="150" cy="440" rx="88" ry="10" fill={`url(#${ID.gs})`} />

        {/* ── Orelhas ── */}
        <circle cx="68"  cy="40" r="26" fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <circle cx="68"  cy="46" r="14" fill="#12101E" />
        <ellipse cx="63" cy="33" rx="9" ry="5" fill="rgba(255,255,255,.09)" clipPath={`url(#${ID.le})`} />
        <circle cx="46"  cy="40" r="23" className="panda-rl" clipPath={`url(#${ID.le})`} />

        <circle cx="232" cy="40" r="26" fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <circle cx="232" cy="46" r="14" fill="#12101E" />
        <ellipse cx="237" cy="33" rx="9" ry="5" fill="rgba(255,255,255,.09)" clipPath={`url(#${ID.re})`} />

        {/* ── Pernas ── */}
        <rect x="84"  y="368" width="60" height="52" rx="26" fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <ellipse cx="114" cy="377" rx="18" ry="6" fill="rgba(255,255,255,.10)" clipPath={`url(#${ID.ll})`} />
        <rect x="84"  y="368" width="26" height="52" rx="22" className="panda-rl" clipPath={`url(#${ID.ll})`} />

        <rect x="156" y="368" width="60" height="52" rx="26" fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <ellipse cx="186" cy="377" rx="18" ry="6" fill="rgba(255,255,255,.10)" clipPath={`url(#${ID.rl})`} />

        {/* ── Corpo barril ── */}
        <rect x="54" y="212" width="192" height="182" rx="58" ry="54"
              fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <rect x="54" y="212" width="88"  height="182" rx="56" ry="54"
              className="panda-rl" clipPath={`url(#${ID.bd})`} />
        <ellipse cx="150" cy="220" rx="56" ry="11"
                 fill="rgba(255,255,255,.06)" clipPath={`url(#${ID.bd})`} />
        <ellipse cx="152" cy="294" rx="70" ry="80"
                 fill="#FFFFFF" stroke="#0D0C1A" strokeWidth="3" />
        <ellipse cx="152" cy="362" rx="46" ry="16"
                 fill="rgba(0,0,0,.07)" clipPath={`url(#${ID.bd})`} />

        {/* ── Braços ── */}
        <rect x="10" y="228" width="58" height="90" rx="28"
              transform="rotate(-12,39,273)"
              fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <rect x="10" y="228" width="28" height="90" rx="22"
              transform="rotate(-12,39,273)"
              className="panda-rl" clipPath={`url(#${ID.la})`} />
        <rect x="56" y="233" width="8"  height="80" rx="4"
              transform="rotate(-12,60,273)"
              fill="rgba(255,255,255,.10)" clipPath={`url(#${ID.la})`} />

        <rect x="232" y="228" width="58" height="90" rx="28"
              transform="rotate(12,261,273)"
              fill="#1A1828" stroke="#0D0C1A" strokeWidth="4" />
        <rect x="262" y="228" width="28" height="90" rx="22"
              transform="rotate(12,261,273)"
              className="panda-rl" clipPath={`url(#${ID.ra})`} />
        <rect x="236" y="233" width="8"  height="80" rx="4"
              transform="rotate(12,240,273)"
              fill="rgba(255,255,255,.10)" clipPath={`url(#${ID.ra})`} />

        {/* ── Cabeça ── */}
        <circle cx="150" cy="112" r="94"
                fill="#F8F6F2" stroke="#0D0C1A" strokeWidth="4" />
        <ellipse cx="184" cy="66" rx="24" ry="15"
                 fill="rgba(255,255,255,.60)" clipPath={`url(#${ID.hd})`} />
        <ellipse cx="188" cy="62" rx="10" ry="6"
                 fill="rgba(255,255,255,.90)" clipPath={`url(#${ID.hd})`} />
        <ellipse cx="150" cy="200" rx="38" ry="8" fill="rgba(0,0,0,.17)" />

        {/* ── Manchas dos olhos ── */}
        <ellipse cx="107" cy="118" rx="37" ry="31"
                 transform="rotate(-8,107,118)"
                 fill="#1A1828" stroke="#0D0C1A" strokeWidth="3" />
        <ellipse cx="100" cy="103" rx="15" ry="7"
                 transform="rotate(-8,100,103)"
                 fill="rgba(255,255,255,.12)" clipPath={`url(#${ID.epL})`} />

        <ellipse cx="193" cy="118" rx="37" ry="31"
                 transform="rotate(8,193,118)"
                 fill="#1A1828" stroke="#0D0C1A" strokeWidth="3" />
        <ellipse cx="200" cy="103" rx="15" ry="7"
                 transform="rotate(8,200,103)"
                 fill="rgba(255,255,255,.12)" clipPath={`url(#${ID.epR})`} />

        {/* ── Olhos ── */}
        <circle cx="107" cy="119" r="19" fill="#FFFFFF" />
        <circle cx="110" cy="121" r="13" fill="#2C1F10" />
        <circle cx="110" cy="121" r="8"  fill="#08071A" />
        <circle cx="117" cy="112" r="6"  fill="#FFFFFF" />
        <circle cx="104" cy="128" r="2.5" fill="rgba(255,255,255,.6)" />

        <circle cx="193" cy="119" r="19" fill="#FFFFFF" />
        <circle cx="190" cy="121" r="13" fill="#2C1F10" />
        <circle cx="190" cy="121" r="8"  fill="#08071A" />
        <circle cx="183" cy="112" r="6"  fill="#FFFFFF" />
        <circle cx="196" cy="128" r="2.5" fill="rgba(255,255,255,.6)" />

        {/* Pálpebras */}
        {theme.lids && (
          <g>
            <ellipse cx="107" cy="112" rx="20" ry="14" fill="#1A1828" />
            <ellipse cx="193" cy="112" rx="20" ry="14" fill="#1A1828" />
          </g>
        )}

        {/* ── Bochechas ── */}
        <ellipse cx="88"  cy="160" rx="13" ry="8" fill="rgba(255,110,135,.40)" />
        <ellipse cx="212" cy="160" rx="13" ry="8" fill="rgba(255,110,135,.40)" />

        {/* ── Focinho ── */}
        <ellipse cx="150" cy="162" rx="34" ry="23"
                 fill="#EDECEA" stroke="#B8B5B0" strokeWidth="1.5" />
        <ellipse cx="150" cy="150" rx="28" ry="8"
                 fill="rgba(0,0,0,.07)" clipPath={`url(#${ID.mz})`} />
        <line x1="150" y1="162" x2="150" y2="172"
              stroke="#C0BCBA" strokeWidth="1.2" />

        {/* Nariz */}
        <ellipse cx="150" cy="154" rx="12" ry="8" fill="#1A1828" />
        <ellipse cx="146" cy="151" rx="4"  ry="2.5" fill="rgba(255,255,255,.42)" />
        <circle  cx="145" cy="158" r="1.8" fill="#0D0C18" />
        <circle  cx="155" cy="158" r="1.8" fill="#0D0C18" />

        {/* Boca */}
        <path d="M 141 167 Q 150 177 159 167 Q 153 175 147 175 Z"
              fill="rgba(40,20,20,.22)" />
        <path d="M 141 167 Q 150 177 159 167"
              stroke="#1A1828" strokeWidth="2.8" />

        {/* ZZZ */}
        {theme.zzz && (
          <g>
            <text
              x="176" y="84"
              fontFamily="sans-serif" fontSize="21" fontWeight="800"
              fill="rgba(255,255,255,.85)"
              style={{ animation: 'panda-zzz 2.5s ease-in-out infinite' }}
            >
              z
            </text>
            <text
              x="194" y="66"
              fontFamily="sans-serif" fontSize="15" fontWeight="700"
              fill="rgba(255,255,255,.5)"
              style={{ animation: 'panda-zzz2 2.5s ease-in-out infinite 0.6s' }}
            >
              z
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
