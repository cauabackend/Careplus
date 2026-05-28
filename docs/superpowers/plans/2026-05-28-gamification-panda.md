# CarePlus+ V2 — Gamification + Panda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o mascote Panda como componente React com animações e estados de saúde, o hook `useVitalsWeather`, as páginas SentinelPage / ChroniclePage / HealthChainsPage, e integrar o panda em todas as páginas com animações de evento.

**Architecture:** `PandaMascot.jsx` extrai o SVG de `public/panda-cute.html` como componente React puro, recebendo `healthState` + `pageContext` + `event` + `size` como props. `useVitalsWeather.js` calcula o score 0–100 a partir do progresso diário da API e o mapeia para os 4 estados. `DashboardLayout` recebe as CSS variables de Vitals Weather para que o fundo e os elementos da UI reajam ao estado de saúde. As 3 novas páginas consomem `api.js` definido no Plano 2.

**Tech Stack:** React 18, Vitest 1, @testing-library/react, @testing-library/jest-dom, jsdom, Tailwind CSS 3, lucide-react

**Pré-requisito:** Plano 1 (backend Django rodando em `localhost:8000`) + Plano 2 (frontend foundation) implementados.

---

## File Map

```
frontend/src/
├── components/
│   └── PandaMascot/
│       ├── PandaMascot.jsx         ← CRIAR: mascote SVG como componente React
│       └── PandaMascot.css         ← CRIAR: keyframes de animação + classe .panda-rl
├── hooks/
│   └── useVitalsWeather.js         ← CRIAR: score 0-100 + estado + hook React
├── test-setup.js                   ← CRIAR: configura jest-dom matchers
├── pages/
│   ├── SentinelPage/
│   │   └── SentinelPage.jsx        ← CRIAR: alertas SENTINEL + panda alerta (sm)
│   ├── ChroniclePage/
│   │   └── ChroniclePage.jsx       ← CRIAR: visualização livro + panda lendo (md)
│   └── HealthChainsPage/
│       └── HealthChainsPage.jsx    ← CRIAR: conexões + eventos + impacto + panda (md)
├── components/
│   └── DashboardLayout/
│       └── DashboardLayout.jsx     ← MODIFICAR: injeta CSS vars de Vitals Weather
├── pages/
│   ├── DashboardPage/
│   │   └── DashboardPage.jsx       ← MODIFICAR: PandaMascot hero lg (270px)
│   └── MissoesPage/
│       └── MissoesPage.jsx         ← MODIFICAR: PandaMascot md (160px) + jump event
└── App.jsx                         ← MODIFICAR: substitui stubs pelas páginas reais
```

---

## Task 1: PandaMascot — CSS e keyframes

**Files:**
- Create: `frontend/src/components/PandaMascot/PandaMascot.css`

- [ ] **Step 1: Criar o arquivo de animações**

```css
/* src/components/PandaMascot/PandaMascot.css */

/* ── Rim light dinâmica (cor herdada via --accent na SVG) ── */
.panda-rl {
  fill: var(--accent);
  opacity: 0.18;
}

/* ── Animações contínuas ── */
@keyframes panda-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-14px); }
}
@keyframes panda-breathe {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.025); }
}

/* ── Animações de evento (one-shot) ── */
@keyframes panda-jump {
  0%   { transform: translateY(0); }
  30%  { transform: translateY(-30px); }
  60%  { transform: translateY(-10px); }
  80%  { transform: translateY(-22px); }
  100% { transform: translateY(0); }
}
@keyframes panda-spin {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes panda-wave {
  0%, 100% { transform: rotate(0deg); transform-origin: bottom center; }
  25%       { transform: rotate(-9deg); transform-origin: bottom center; }
  75%       { transform: rotate(9deg);  transform-origin: bottom center; }
}
@keyframes panda-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}
@keyframes panda-bounce-in {
  0%   { transform: scale(0); }
  55%  { transform: scale(1.18); }
  75%  { transform: scale(0.93); }
  90%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* ── ZZZ (estado critical) ── */
@keyframes panda-zzz {
  0%   { opacity: 0; transform: translate(0, 0) scale(0.5); }
  40%  { opacity: 1; }
  100% { opacity: 0; transform: translate(-12px, -56px) scale(1.3); }
}
@keyframes panda-zzz2 {
  0%   { opacity: 0; transform: translate(0, 0) scale(0.4); }
  40%  { opacity: 0.6; }
  100% { opacity: 0; transform: translate(-7px, -40px) scale(0.9); }
}
```

- [ ] **Step 2: Commit parcial**

```bash
git add frontend/src/components/PandaMascot/PandaMascot.css
git commit -m "feat: add PandaMascot CSS keyframe animations"
```

---

## Task 2: PandaMascot — Componente React

**Files:**
- Create: `frontend/src/components/PandaMascot/PandaMascot.jsx`

- [ ] **Step 1: Criar o componente**

O SVG é convertido de `public/panda-cute.html` para JSX: `class` → `className`, `stroke-width` → `strokeWidth`, `clip-path` → `clipPath`, `stop-color` → `stopColor`. IDs são prefixados com `uid` (via `useId`) para evitar conflitos quando múltiplas instâncias são renderizadas simultaneamente.

```jsx
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
  // useId pode retornar ":r0:" — sanitizar para uso em IDs SVG
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const [activeEvent, setActiveEvent] = useState(null);
  const theme = HEALTH_THEMES[healthState] ?? HEALTH_THEMES.good;
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Dispara animação de evento e limpa após a duração
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

  // IDs únicos para defs SVG
  const ID = {
    gs:    `panda-gs-${uid}`,
    bd:    `panda-bd-${uid}`,
    hd:    `panda-hd-${uid}`,
    la:    `panda-la-${uid}`,
    ra:    `panda-ra-${uid}`,
    le:    `panda-le-${uid}`,
    re:    `panda-re-${uid}`,
    ll:    `panda-ll-${uid}`,
    rl:    `panda-rl-${uid}`,
    epL:   `panda-epl-${uid}`,
    epR:   `panda-epr-${uid}`,
    mz:    `panda-mz-${uid}`,
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
        {/* Barriga branca */}
        <ellipse cx="152" cy="294" rx="70" ry="80"
                 fill="#FFFFFF" stroke="#0D0C1A" strokeWidth="3" />
        <ellipse cx="152" cy="362" rx="46" ry="16"
                 fill="rgba(0,0,0,.07)" clipPath={`url(#${ID.bd})`} />

        {/* ── Braços (desenhados DEPOIS do corpo para ficarem na frente) ── */}
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

        {/* Pálpebras — visíveis em warning e critical */}
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

        {/* ZZZ — visível apenas em critical */}
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/PandaMascot/
git commit -m "feat: add PandaMascot React component with health states and event animations"
```

---

## Task 3: Vitest setup + testes do PandaMascot

**Files:**
- Modify: `frontend/vite.config.js`
- Create: `frontend/src/test-setup.js`
- Create: `frontend/src/components/PandaMascot/PandaMascot.test.jsx`

- [ ] **Step 1: Instalar dependências de teste**

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Configurar Vitest no vite.config.js**

Adicionar a seção `test` ao `vite.config.js` existente (o arquivo já tem `plugins: [react()]`):

```js
// vite.config.js — adicionar a seção test:
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 3: Criar test-setup.js**

```js
// src/test-setup.js
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Adicionar script de teste ao package.json**

No `frontend/package.json`, adicionar em `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Escrever testes do PandaMascot**

```jsx
// src/components/PandaMascot/PandaMascot.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PandaMascot from './PandaMascot';

describe('PandaMascot', () => {
  it('renderiza sem erros com props padrão', () => {
    const { container } = render(<PandaMascot />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renderiza em tamanho lg (270px)', () => {
    const { container } = render(<PandaMascot size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '270');
  });

  it('renderiza em tamanho sm (120px)', () => {
    const { container } = render(<PandaMascot size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '120');
  });

  it('não exibe pálpebras em estado excellent', () => {
    const { container } = render(<PandaMascot healthState="excellent" />);
    // Em excellent, theme.lids = false → nenhum ellipse com cx=107 cy=112
    const svg = container.querySelector('svg');
    // Conta ellipses — em excellent não há pálpebras extras
    const ellipses = svg.querySelectorAll('ellipse[cx="107"]');
    // Os patches têm cx=107 cy=118, mas as pálpebras têm cx=107 cy=112
    const eyelids = Array.from(svg.querySelectorAll('ellipse')).filter(
      el => el.getAttribute('cx') === '107' && el.getAttribute('cy') === '112'
    );
    expect(eyelids).toHaveLength(0);
  });

  it('exibe pálpebras em estado critical', () => {
    const { container } = render(<PandaMascot healthState="critical" />);
    const svg = container.querySelector('svg');
    const eyelids = Array.from(svg.querySelectorAll('ellipse')).filter(
      el => el.getAttribute('cx') === '107' && el.getAttribute('cy') === '112'
    );
    expect(eyelids).toHaveLength(1);
  });

  it('exibe ZZZ em estado critical', () => {
    const { container } = render(<PandaMascot healthState="critical" />);
    const svg = container.querySelector('svg');
    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it('não exibe ZZZ em estado excellent', () => {
    const { container } = render(<PandaMascot healthState="excellent" />);
    const svg = container.querySelector('svg');
    const texts = svg.querySelectorAll('text');
    expect(texts).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Rodar testes para confirmar que passam**

```bash
cd frontend
npm test
```

Saída esperada: `7 tests passed`

- [ ] **Step 7: Commit**

```bash
git add frontend/vite.config.js frontend/src/test-setup.js frontend/src/components/PandaMascot/PandaMascot.test.jsx frontend/package.json
git commit -m "test: add Vitest setup and PandaMascot smoke tests"
```

---

## Task 4: useVitalsWeather (TDD)

**Files:**
- Create: `frontend/src/hooks/useVitalsWeather.js`
- Create: `frontend/src/hooks/useVitalsWeather.test.js`

- [ ] **Step 1: Escrever os testes (falham porque o módulo não existe)**

```js
// src/hooks/useVitalsWeather.test.js
import { describe, it, expect } from 'vitest';
import { calcularScore, scoreParaEstado } from './useVitalsWeather';

describe('calcularScore', () => {
  it('retorna 0 para progresso null', () => {
    expect(calcularScore(null)).toBe(0);
  });

  it('retorna 0 para progresso undefined', () => {
    expect(calcularScore(undefined)).toBe(0);
  });

  it('retorna 100 para dia perfeito (8000 passos, 2L água, 8h sono)', () => {
    expect(calcularScore({ passos: 8000, agua: 2.0, sono: 8 })).toBe(100);
  });

  it('retorna 40 apenas com 8000 passos e sem agua/sono', () => {
    expect(calcularScore({ passos: 8000, agua: 0, sono: 0 })).toBe(40);
  });

  it('retorna 30 apenas com 2L de água e sem passos/sono', () => {
    expect(calcularScore({ passos: 0, agua: 2.0, sono: 0 })).toBe(30);
  });

  it('retorna 30 apenas com 8h de sono e sem passos/agua', () => {
    expect(calcularScore({ passos: 0, agua: 0, sono: 8 })).toBe(30);
  });

  it('retorna 0 com 4h de sono (limiar mínimo)', () => {
    expect(calcularScore({ passos: 0, agua: 0, sono: 4 })).toBe(0);
  });

  it('não ultrapassa 100 mesmo com valores acima das metas', () => {
    expect(calcularScore({ passos: 20000, agua: 5.0, sono: 12 })).toBe(100);
  });

  it('retorna score proporcional para meio caminho (4000 passos, 1L, 6h)', () => {
    // passos: (4000/8000)*40 = 20
    // agua:   (1.0/2.0)*30  = 15
    // sono:   (6-4)/(8-4)*30 = 2/4*30 = 15
    // total = 50
    expect(calcularScore({ passos: 4000, agua: 1.0, sono: 6 })).toBe(50);
  });
});

describe('scoreParaEstado', () => {
  it('retorna excellent para score >= 75', () => {
    expect(scoreParaEstado(75)).toBe('excellent');
    expect(scoreParaEstado(100)).toBe('excellent');
  });

  it('retorna good para score entre 50 e 74', () => {
    expect(scoreParaEstado(50)).toBe('good');
    expect(scoreParaEstado(74)).toBe('good');
  });

  it('retorna warning para score entre 25 e 49', () => {
    expect(scoreParaEstado(25)).toBe('warning');
    expect(scoreParaEstado(49)).toBe('warning');
  });

  it('retorna critical para score abaixo de 25', () => {
    expect(scoreParaEstado(0)).toBe('critical');
    expect(scoreParaEstado(24)).toBe('critical');
  });
});
```

- [ ] **Step 2: Rodar para confirmar que falham**

```bash
cd frontend
npm test
```

Saída esperada: `Cannot find module './useVitalsWeather'`

- [ ] **Step 3: Implementar useVitalsWeather.js**

```js
// src/hooks/useVitalsWeather.js
import { useState, useEffect } from 'react';
import { getProgressoHoje } from '../services/api';

/**
 * Calcula o score de saúde do dia (0–100) a partir do progresso diário.
 *
 * Pesos:
 *   - Passos: meta 8000 → vale até 40 pontos
 *   - Água:   meta 2.0L → vale até 30 pontos
 *   - Sono:   meta 8h, limiar mínimo 4h → vale até 30 pontos
 *
 * @param {Object|null|undefined} progresso
 * @returns {number} Score de 0 a 100
 */
export function calcularScore(progresso) {
  if (!progresso) return 0;
  const { passos = 0, agua = 0, sono = 0 } = progresso;

  const passosScore = Math.min((passos / 8000) * 40, 40);
  const aguaScore   = Math.min((agua / 2.0) * 30, 30);
  const sonoNorm    = Math.max(0, Math.min((sono - 4) / (8 - 4), 1));
  const sonoScore   = sonoNorm * 30;

  return Math.round(passosScore + aguaScore + sonoScore);
}

/**
 * Mapeia score 0-100 para um dos 4 estados de saúde.
 *
 * @param {number} score
 * @returns {'excellent'|'good'|'warning'|'critical'}
 */
export function scoreParaEstado(score) {
  if (score >= 75) return 'excellent';
  if (score >= 50) return 'good';
  if (score >= 25) return 'warning';
  return 'critical';
}

/**
 * Hook React: busca o progresso de hoje via API e retorna o estado de saúde.
 *
 * @returns {{ estado: string, score: number, loading: boolean }}
 */
export function useVitalsWeather() {
  const [estado, setEstado]   = useState('good');
  const [score, setScore]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgressoHoje()
      .then(progresso => {
        const s = calcularScore(progresso);
        setScore(s);
        setEstado(scoreParaEstado(s));
      })
      .catch(() => {
        // Sem dados = estado neutro
        setEstado('good');
        setScore(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return { estado, score, loading };
}
```

- [ ] **Step 4: Rodar testes para confirmar que passam**

```bash
cd frontend
npm test
```

Saída esperada: `13 tests passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useVitalsWeather.js frontend/src/hooks/useVitalsWeather.test.js
git commit -m "feat: add useVitalsWeather hook with score calculation (TDD)"
```

---

## Task 5: SentinelPage

**Files:**
- Create: `frontend/src/pages/SentinelPage/SentinelPage.jsx`
- Create: `frontend/src/pages/SentinelPage/SentinelPage.test.jsx`

- [ ] **Step 1: Escrever teste (falha)**

```jsx
// src/pages/SentinelPage/SentinelPage.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SentinelPage from './SentinelPage';

// Mock da camada de API para evitar fetch real
vi.mock('../../services/api', () => ({
  getSentinelAlertas: vi.fn().mockResolvedValue([]),
}));

// Mock do hook de vitals para retorno controlado
vi.mock('../../hooks/useVitalsWeather', () => ({
  useVitalsWeather: () => ({ estado: 'good', score: 60, loading: false }),
}));

describe('SentinelPage', () => {
  it('renderiza o título SENTINEL', async () => {
    render(<SentinelPage />);
    expect(screen.getByText('SENTINEL')).toBeInTheDocument();
  });

  it('exibe mensagem de tudo certo quando sem alertas', async () => {
    render(<SentinelPage />);
    // Aguarda o useEffect resolver
    await screen.findByText('Tudo certo por aqui!');
  });
});
```

- [ ] **Step 2: Rodar para confirmar falha**

```bash
cd frontend
npm test
```

Saída esperada: `Cannot find module './SentinelPage'`

- [ ] **Step 3: Criar SentinelPage.jsx**

```jsx
// src/pages/SentinelPage/SentinelPage.jsx
import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getSentinelAlertas, marcarAlertaLido } from '../../services/api';
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
import PandaMascot from '../../components/PandaMascot/PandaMascot';

const TIPO_LABEL = {
  sleep_debt:     'Déficit de Sono',
  hydration_low:  'Hidratação Baixa',
  burnout_risk:   'Risco de Burnout',
  streak_break:   'Streak em Risco',
};

// Tailwind classes por tipo de alerta
const TIPO_STYLE = {
  sleep_debt:    'text-blue-300 bg-blue-900/30 border-blue-700/40',
  hydration_low: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/40',
  burnout_risk:  'text-red-300  bg-red-900/30  border-red-700/40',
  streak_break:  'text-amber-300 bg-amber-900/30 border-amber-700/40',
};

export default function SentinelPage() {
  const { estado } = useVitalsWeather();
  const [alertas, setAlertas]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pandaEvent, setPandaEvent] = useState('app_open');

  const ativos   = alertas.filter(a => !a.lido);
  const lidos    = alertas.filter(a =>  a.lido);

  useEffect(() => {
    getSentinelAlertas()
      .then(data => {
        setAlertas(data);
        if (data.some(a => !a.lido)) {
          setPandaEvent('alert_triggered');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const marcarLido = async (id) => {
    try {
      await marcarAlertaLido(id);
      setAlertas(prev =>
        prev.map(a => (a.id === id ? { ...a, lido: true } : a))
      );
    } catch (err) {
      console.error('Erro ao marcar alerta:', err);
    }
  };

  return (
    <main className="min-h-screen bg-cp-navy text-white p-6 max-w-2xl mx-auto">

      {/* Cabeçalho */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-cp-teal" />
            <h1 className="text-2xl font-bold tracking-tight">SENTINEL</h1>
          </div>
          <p className="text-white/40 text-sm">
            Monitoramento inteligente dos últimos 14 dias
          </p>
        </div>

        {/* Panda — pequeno (120px), postura alerta */}
        <PandaMascot
          healthState={ativos.length > 0 ? 'warning' : estado}
          pageContext="sentinel"
          event={pandaEvent}
          size="sm"
        />
      </header>

      {/* Estado de carregamento */}
      {loading && (
        <p className="text-white/40 text-sm">Analisando seus dados...</p>
      )}

      {/* Sem alertas */}
      {!loading && ativos.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl border border-white/5 bg-white/3"
          role="status"
          aria-live="polite"
        >
          <p className="text-cp-success text-lg font-semibold">
            Tudo certo por aqui!
          </p>
          <p className="text-white/40 text-sm mt-2">
            Nenhum alerta ativo nos últimos 14 dias.
          </p>
        </div>
      )}

      {/* Alertas ativos */}
      {ativos.length > 0 && (
        <section aria-label="Alertas ativos" className="space-y-3 mb-8">
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            {ativos.length} alerta{ativos.length > 1 ? 's' : ''} ativo{ativos.length > 1 ? 's' : ''}
          </h2>
          {ativos.map(alerta => (
            <article
              key={alerta.id}
              className={`border rounded-xl p-4 flex items-start justify-between gap-4 ${
                TIPO_STYLE[alerta.tipo] ?? 'text-white/70 bg-white/5 border-white/10'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
                </p>
                <p className="text-xs opacity-75 mt-1 leading-relaxed">
                  {alerta.mensagem}
                </p>
              </div>
              <button
                onClick={() => marcarLido(alerta.id)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20
                           transition-colors whitespace-nowrap flex-shrink-0"
              >
                Marcar lido
              </button>
            </article>
          ))}
        </section>
      )}

      {/* Alertas anteriores (já lidos) */}
      {lidos.length > 0 && (
        <section aria-label="Alertas anteriores">
          <h2 className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-3">
            Anteriores
          </h2>
          <div className="space-y-2">
            {lidos.map(alerta => (
              <article
                key={alerta.id}
                className="border border-white/5 rounded-xl p-3 opacity-35"
              >
                <p className="text-xs font-medium">
                  {TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
                </p>
                <p className="text-xs opacity-70 mt-0.5">
                  {alerta.mensagem}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Rodar testes**

```bash
cd frontend
npm test
```

Saída esperada: `15 tests passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/SentinelPage/
git commit -m "feat: add SentinelPage with SENTINEL alerts and panda mascot"
```

---

## Task 6: ChroniclePage

**Files:**
- Create: `frontend/src/pages/ChroniclePage/ChroniclePage.jsx`
- Create: `frontend/src/pages/ChroniclePage/ChroniclePage.test.jsx`

- [ ] **Step 1: Escrever teste (falha)**

```jsx
// src/pages/ChroniclePage/ChroniclePage.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChroniclePage from './ChroniclePage';

vi.mock('../../services/api', () => ({
  getChronicle: vi.fn().mockResolvedValue([
    { ano: 2026, mes: 5, dias_ativos: 18, total_dias: 31, densidade: 0.58 },
  ]),
}));
vi.mock('../../hooks/useVitalsWeather', () => ({
  useVitalsWeather: () => ({ estado: 'excellent', score: 85, loading: false }),
}));

describe('ChroniclePage', () => {
  it('renderiza o título The Chronicle', async () => {
    render(<ChroniclePage />);
    expect(screen.getByText('The Chronicle')).toBeInTheDocument();
  });

  it('exibe o mês de maio após carregar dados', async () => {
    render(<ChroniclePage />);
    await screen.findByText(/maio/i);
  });
});
```

- [ ] **Step 2: Rodar para confirmar falha**

```bash
npm test
```

Saída esperada: `Cannot find module './ChroniclePage'`

- [ ] **Step 3: Criar ChroniclePage.jsx**

A visualização de livro: dois meses lado a lado como páginas de um livro. Cada página tem linhas horizontais cujo preenchimento corresponde à densidade de dias ativos naquele mês.

```jsx
// src/pages/ChroniclePage/ChroniclePage.jsx
import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { getChronicle } from '../../services/api';
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
import PandaMascot from '../../components/PandaMascot/PandaMascot';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

/**
 * Renderiza uma página do livro para um único mês.
 * As linhas representam os dias do mês; linhas "preenchidas" = dias ativos.
 */
function BookPage({ mes }) {
  if (!mes) {
    return (
      <div className="flex-1 bg-white/3 rounded-xl border border-white/8 p-5 min-h-48
                      flex items-center justify-center">
        <p className="text-white/15 text-xs italic">página em branco</p>
      </div>
    );
  }

  const { mes: mesNum, ano, dias_ativos, total_dias, densidade } = mes;
  const nome = MESES[(mesNum - 1) % 12];

  // Simula as "linhas" do diário: total_dias linhas, dias_ativos preenchidas
  const linhas = Array.from({ length: total_dias }, (_, i) => i < dias_ativos);

  return (
    <article
      className="flex-1 bg-white/4 rounded-xl border border-white/10 p-5
                 flex flex-col gap-3"
      aria-label={`${nome} ${ano}: ${dias_ativos} de ${total_dias} dias ativos`}
    >
      {/* Cabeçalho da página */}
      <header className="flex justify-between items-baseline">
        <h3 className="text-sm font-semibold text-white/80">{nome}</h3>
        <span className="text-xs text-white/30">{ano}</span>
      </header>

      {/* Linhas do diário */}
      <div className="flex flex-col gap-1 flex-1">
        {linhas.map((ativo, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              ativo
                ? 'bg-cp-teal opacity-70'
                : 'bg-white/8'
            }`}
            style={ativo ? { width: `${55 + Math.random() * 40}%` } : { width: '100%' }}
          />
        ))}
      </div>

      {/* Rodapé da página */}
      <footer className="pt-2 border-t border-white/8 flex justify-between items-center">
        <span className="text-xs text-white/40">
          {dias_ativos}/{total_dias} dias
        </span>
        <span
          className={`text-xs font-semibold ${
            densidade >= 0.75 ? 'text-cp-success' :
            densidade >= 0.50 ? 'text-cp-teal'    :
            densidade >= 0.25 ? 'text-cp-orange'  :
                                'text-red-400'
          }`}
        >
          {Math.round(densidade * 100)}%
        </span>
      </footer>
    </article>
  );
}

export default function ChroniclePage() {
  const { estado }        = useVitalsWeather();
  const [meses, setMeses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spreadIdx, setSpreadIdx] = useState(0); // índice do "spread" atual (par de páginas)

  useEffect(() => {
    getChronicle()
      .then(data => {
        setMeses(data);
        // Abre no spread mais recente
        const lastSpread = Math.max(0, Math.floor((data.length - 1) / 2));
        setSpreadIdx(lastSpread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Agrupa em pares: [[mes0, mes1], [mes2, mes3], ...]
  const spreads = [];
  for (let i = 0; i < meses.length; i += 2) {
    spreads.push([meses[i], meses[i + 1] ?? null]);
  }

  const totalSpreads = spreads.length;
  const currentSpread = spreads[spreadIdx] ?? [null, null];

  return (
    <main className="min-h-screen bg-cp-navy text-white p-6 max-w-2xl mx-auto">

      {/* Cabeçalho */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-cp-teal" />
            <h1 className="text-2xl font-bold tracking-tight">The Chronicle</h1>
          </div>
          <p className="text-white/40 text-sm">
            Sua jornada de saúde, página a página
          </p>
        </div>

        {/* Panda — médio (160px), "lendo" o livro */}
        <PandaMascot
          healthState={estado}
          pageContext="chronicle"
          event="app_open"
          size="md"
        />
      </header>

      {loading && (
        <p className="text-white/40 text-sm">Carregando seu diário...</p>
      )}

      {!loading && meses.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-white/5">
          <p className="text-white/40 text-sm">
            Nenhum dado registrado ainda.
            <br />Complete missões para preencher seu diário!
          </p>
        </div>
      )}

      {/* Livro — spread atual */}
      {!loading && meses.length > 0 && (
        <>
          {/* Spread de páginas */}
          <section
            aria-label="Páginas do diário"
            className="flex gap-4 mb-6"
          >
            <BookPage mes={currentSpread[0]} />
            {/* Lombada */}
            <div className="w-3 bg-white/5 rounded-sm self-stretch" />
            <BookPage mes={currentSpread[1]} />
          </section>

          {/* Navegação entre spreads */}
          {totalSpreads > 1 && (
            <nav
              className="flex items-center justify-center gap-4"
              aria-label="Navegar entre meses"
            >
              <button
                onClick={() => setSpreadIdx(i => Math.max(0, i - 1))}
                disabled={spreadIdx === 0}
                className="px-4 py-2 rounded-lg text-sm bg-white/8 hover:bg-white/14
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-white/30 text-xs tabular-nums">
                {spreadIdx + 1} / {totalSpreads}
              </span>
              <button
                onClick={() => setSpreadIdx(i => Math.min(totalSpreads - 1, i + 1))}
                disabled={spreadIdx === totalSpreads - 1}
                className="px-4 py-2 rounded-lg text-sm bg-white/8 hover:bg-white/14
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Próximo →
              </button>
            </nav>
          )}

          {/* Resumo geral */}
          {meses.length > 0 && (
            <footer className="mt-8 pt-6 border-t border-white/8 text-center">
              <p className="text-white/40 text-xs">
                {meses.reduce((acc, m) => acc + m.dias_ativos, 0)} dias ativos
                {' '}no total ao longo de {meses.length} {meses.length === 1 ? 'mês' : 'meses'}
              </p>
            </footer>
          )}
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Rodar testes**

```bash
npm test
```

Saída esperada: `17 tests passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ChroniclePage/
git commit -m "feat: add ChroniclePage with book visualization"
```

---

## Task 7: HealthChainsPage

**Files:**
- Create: `frontend/src/pages/HealthChainsPage/HealthChainsPage.jsx`
- Create: `frontend/src/pages/HealthChainsPage/HealthChainsPage.test.jsx`

- [ ] **Step 1: Escrever teste (falha)**

```jsx
// src/pages/HealthChainsPage/HealthChainsPage.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HealthChainsPage from './HealthChainsPage';

vi.mock('../../services/api', () => ({
  getChainsConexoes: vi.fn().mockResolvedValue([]),
  getChainsEventos:  vi.fn().mockResolvedValue([]),
  getChainsImpacto:  vi.fn().mockResolvedValue({ total_beneficiadas: 0 }),
  criarConexao:      vi.fn(),
  deletarConexao:    vi.fn(),
}));
vi.mock('../../hooks/useVitalsWeather', () => ({
  useVitalsWeather: () => ({ estado: 'good', score: 65, loading: false }),
}));

describe('HealthChainsPage', () => {
  it('renderiza o título Health Chains', async () => {
    render(<HealthChainsPage />);
    expect(screen.getByText('Health Chains')).toBeInTheDocument();
  });

  it('mostra mensagem de nenhum amigo quando lista vazia', async () => {
    render(<HealthChainsPage />);
    await screen.findByText(/nenhum amigo/i);
  });
});
```

- [ ] **Step 2: Rodar para confirmar falha**

```bash
npm test
```

Saída esperada: `Cannot find module './HealthChainsPage'`

- [ ] **Step 3: Criar HealthChainsPage.jsx**

```jsx
// src/pages/HealthChainsPage/HealthChainsPage.jsx
import { useState, useEffect } from 'react';
import { Link2, UserPlus, Trash2, Zap } from 'lucide-react';
import {
  getChainsConexoes,
  getChainsEventos,
  getChainsImpacto,
  criarConexao,
  deletarConexao,
} from '../../services/api';
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
import PandaMascot from '../../components/PandaMascot/PandaMascot';

export default function HealthChainsPage() {
  const { estado }                = useVitalsWeather();
  const [conexoes, setConexoes]   = useState([]);
  const [eventos, setEventos]     = useState([]);
  const [impacto, setImpacto]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [email, setEmail]         = useState('');
  const [erro, setErro]           = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [pandaEvent, setPandaEvent]   = useState('app_open');

  useEffect(() => {
    Promise.all([
      getChainsConexoes(),
      getChainsEventos(),
      getChainsImpacto(),
    ])
      .then(([c, e, imp]) => {
        setConexoes(c);
        setEventos(e);
        setImpacto(imp?.total_beneficiadas ?? 0);
        // Panda acena se há eventos recentes
        if (e.length > 0) {
          setPandaEvent('friend_helped');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdicionarAmigo = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErro('');
    setAdicionando(true);
    try {
      const novaConexao = await criarConexao(email.trim());
      setConexoes(prev => [...prev, novaConexao]);
      setEmail('');
    } catch (err) {
      setErro(
        err?.response?.data?.detail ??
        'Usuário não encontrado ou já conectado.'
      );
    } finally {
      setAdicionando(false);
    }
  };

  const handleRemover = async (id) => {
    try {
      await deletarConexao(id);
      setConexoes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erro ao remover conexão:', err);
    }
  };

  const eventosRecebidos = eventos.filter(ev => ev.tipo === 'recebido');
  const eventosCausados  = eventos.filter(ev => ev.tipo === 'causado');

  return (
    <main className="min-h-screen bg-cp-navy text-white p-6 max-w-2xl mx-auto">

      {/* Cabeçalho */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-cp-teal" />
            <h1 className="text-2xl font-bold tracking-tight">Health Chains</h1>
          </div>
          <p className="text-white/40 text-sm">
            Suas missões inspiram quem você conecta
          </p>
        </div>

        {/* Panda — médio (160px), acenando */}
        <PandaMascot
          healthState={estado}
          pageContext="chains"
          event={pandaEvent}
          size="md"
        />
      </header>

      {/* Contador de impacto anual */}
      {impacto > 0 && (
        <section
          aria-label="Impacto anual"
          className="mb-6 p-4 rounded-2xl border border-cp-teal/30 bg-cp-teal/8
                     flex items-center gap-3"
        >
          <Zap className="w-5 h-5 text-cp-teal flex-shrink-0" />
          <p className="text-sm">
            Você beneficiou{' '}
            <span className="font-bold text-cp-teal">{impacto}</span>
            {' '}pessoa{impacto !== 1 ? 's' : ''} este ano com suas missões!
          </p>
        </section>
      )}

      {/* Adicionar amigo */}
      <section aria-label="Adicionar amigo" className="mb-8">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
          Conectar amigo
        </h2>
        <form onSubmit={handleAdicionarAmigo} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email do amigo"
            aria-label="Email do amigo"
            className="flex-1 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5
                       text-sm placeholder:text-white/30 focus:outline-none
                       focus:border-cp-teal/60 transition-colors"
          />
          <button
            type="submit"
            disabled={adicionando || !email.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cp-teal
                       text-cp-navy font-semibold text-sm hover:bg-cp-teal/90
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {adicionando ? 'Conectando...' : 'Conectar'}
          </button>
        </form>
        {erro && (
          <p className="mt-2 text-red-400 text-xs" role="alert">
            {erro}
          </p>
        )}
      </section>

      {/* Lista de conexões */}
      <section aria-label="Amigos conectados" className="mb-8">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
          Amigos ({conexoes.length})
        </h2>

        {loading && (
          <p className="text-white/30 text-sm">Carregando conexões...</p>
        )}

        {!loading && conexoes.length === 0 && (
          <p className="text-white/30 text-sm italic">
            Nenhum amigo conectado ainda.
          </p>
        )}

        <ul className="space-y-2">
          {conexoes.map(c => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl
                         bg-white/4 border border-white/8"
            >
              <div>
                <p className="text-sm font-medium">{c.destino_nome ?? c.email}</p>
                {c.destino_email && (
                  <p className="text-xs text-white/40">{c.destino_email}</p>
                )}
              </div>
              <button
                onClick={() => handleRemover(c.id)}
                aria-label={`Remover ${c.destino_nome ?? c.email}`}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400
                           hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Eventos recebidos */}
      {eventosRecebidos.length > 0 && (
        <section aria-label="Amigos que te ajudaram" className="mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
            Amigos que te inspiraram hoje
          </h2>
          <ul className="space-y-2">
            {eventosRecebidos.map((ev, i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl
                           bg-cp-teal/8 border border-cp-teal/20 text-sm"
              >
                <Zap className="w-4 h-4 text-cp-teal flex-shrink-0" />
                <p>
                  <span className="font-semibold">{ev.origem_nome}</span>
                  {' '}completou{' '}
                  <span className="text-cp-teal">{ev.missao}</span>
                  {' '}e te deu um boost!
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Eventos causados */}
      {eventosCausados.length > 0 && (
        <section aria-label="Pessoas que você ajudou">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
            Quem você inspirou hoje
          </h2>
          <ul className="space-y-2">
            {eventosCausados.map((ev, i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl
                           bg-cp-gold/8 border border-cp-gold/20 text-sm"
              >
                <Zap className="w-4 h-4 text-cp-gold flex-shrink-0" />
                <p>
                  Sua missão{' '}
                  <span className="text-cp-gold">{ev.missao}</span>
                  {' '}inspirou{' '}
                  <span className="font-semibold">{ev.destino_nome}</span>!
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Rodar testes**

```bash
npm test
```

Saída esperada: `19 tests passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/HealthChainsPage/
git commit -m "feat: add HealthChainsPage with connections, events and impact counter"
```

---

## Task 8: Vitals Weather — Aplicar CSS variables ao DashboardLayout

**Files:**
- Modify: `frontend/src/components/DashboardLayout/DashboardLayout.jsx`

- [ ] **Step 1: Ler o arquivo atual**

Antes de editar, ler `frontend/src/components/DashboardLayout/DashboardLayout.jsx`.

- [ ] **Step 2: Adicionar useVitalsWeather e injetar CSS variables**

Adicionar ao topo do componente:
```jsx
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
```

Declarar o hook dentro do componente:
```jsx
const { estado, score } = useVitalsWeather();
```

Definir o mapa de temas:
```jsx
const WEATHER_THEMES = {
  excellent: { bgA: '#091540', bgB: '#040b1e', accent: '#37C3FF' },
  good:      { bgA: '#062812', bgB: '#031408', accent: '#2DD75F' },
  warning:   { bgA: '#2a1604', bgB: '#160a02', accent: '#FFA023' },
  critical:  { bgA: '#2a0808', bgB: '#160404', accent: '#FF3A3A' },
};
```

Aplicar o tema ao elemento raiz do layout (o `<div>` externo que já existe), adicionando `style` e `className` para a transição:
```jsx
const theme = WEATHER_THEMES[estado] ?? WEATHER_THEMES.good;

// No return, no elemento raiz do layout:
<div
  className="min-h-screen flex transition-all duration-1000"
  style={{
    background: `radial-gradient(ellipse 140% 120% at 22% 58%, ${theme.bgA}, ${theme.bgB} 72%)`,
    '--accent': theme.accent,
  }}
>
  {/* ... conteúdo existente: Sidebar + <main> ... */}
</div>
```

O `style` prop com CSS custom properties (`--accent`) funciona no React 17+ sem nenhuma configuração especial. Todos os componentes filhos que usam `var(--accent)` (como `.panda-rl`) herdam o valor automaticamente.

- [ ] **Step 3: Verificar visualmente**

Iniciar o app (`npm run dev` na pasta `frontend`), registrar manualmente dados de saúde pelo Dashboard, e verificar que o fundo muda suavemente conforme o score.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/DashboardLayout/DashboardLayout.jsx
git commit -m "feat: apply Vitals Weather CSS variables to DashboardLayout"
```

---

## Task 9: Integrar PandaMascot no DashboardPage

**Files:**
- Modify: `frontend/src/pages/DashboardPage/DashboardPage.jsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `frontend/src/pages/DashboardPage/DashboardPage.jsx`.

- [ ] **Step 2: Adicionar PandaMascot como hero (270px)**

Adicionar import:
```jsx
import PandaMascot from '../../components/PandaMascot/PandaMascot';
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
```

No componente, adicionar:
```jsx
const { estado } = useVitalsWeather();
const [pandaEvent, setPandaEvent] = useState('app_open');
```

No JSX, inserir o panda logo após o `<header>` e antes do primeiro grid de StatCards:
```jsx
{/* Panda hero — centro, grande (270px) */}
<div className="flex justify-center mb-6">
  <PandaMascot
    healthState={estado}
    pageContext="dashboard"
    event={pandaEvent}
    size="lg"
  />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DashboardPage/DashboardPage.jsx
git commit -m "feat: add PandaMascot hero (lg) to DashboardPage"
```

---

## Task 10: Integrar PandaMascot no MissoesPage com jump event

**Files:**
- Modify: `frontend/src/pages/MissoesPage/MissoesPage.jsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `frontend/src/pages/MissoesPage/MissoesPage.jsx`.

- [ ] **Step 2: Adicionar PandaMascot com jump na conclusão de missão**

Adicionar imports:
```jsx
import PandaMascot from '../../components/PandaMascot/PandaMascot';
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
```

Adicionar state para o evento do panda:
```jsx
const { estado } = useVitalsWeather();
const [pandaEvent, setPandaEvent] = useState(null);
```

Na função que trata a conclusão de uma missão (localizar o `onClick` ou o handler que chama `concluirMissao`), adicionar após a chamada bem-sucedida:
```jsx
// Dispara animação de pulo no panda
setPandaEvent('mission_complete');
setTimeout(() => setPandaEvent(null), 700);
```

No JSX, adicionar o panda no canto superior direito do `<header>` da página:
```jsx
{/* Panda — canto superior direito, médio (160px) */}
<div className="absolute top-4 right-4">
  <PandaMascot
    healthState={estado}
    pageContext="missoes"
    event={pandaEvent}
    size="md"
  />
</div>
```

O elemento pai do header deve ter `className="... relative"` para que o `absolute` funcione.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/MissoesPage/MissoesPage.jsx
git commit -m "feat: add PandaMascot (md) to MissoesPage with jump animation on mission complete"
```

---

## Task 11: Atualizar App.jsx — substituir stubs pelas páginas reais

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `frontend/src/App.jsx`.

- [ ] **Step 2: Substituir imports dos stubs**

No Plano 2, os stubs de SentinelPage, ChroniclePage e HealthChainsPage foram criados como componentes inline ou arquivos temporários. Substituir os imports pelos reais:

```jsx
// Substituir qualquer import stub por:
import SentinelPage      from './pages/SentinelPage/SentinelPage';
import ChroniclePage     from './pages/ChroniclePage/ChroniclePage';
import HealthChainsPage  from './pages/HealthChainsPage/HealthChainsPage';
```

As rotas no `<Routes>` não precisam mudar — já apontam para os paths corretos.

- [ ] **Step 3: Rodar todos os testes**

```bash
cd frontend
npm test
```

Saída esperada: `19 tests passed` (todos os testes de todas as tasks)

- [ ] **Step 4: Verificar todas as rotas manualmente**

Iniciar backend e frontend:
```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

Verificar no browser (localhost:5173 ou 3000 conforme launch.json):
1. `/login` → LoginPage renderiza
2. `/dashboard` → DashboardPage com PandaMascot hero visível
3. `/missoes` → MissoesPage com PandaMascot no canto superior direito
4. `/sentinel` → SentinelPage com panda pequeno
5. `/chronicle` → ChroniclePage com panda médio
6. `/chains` → HealthChainsPage com panda médio acenando

- [ ] **Step 5: Commit final**

```bash
git add frontend/src/App.jsx
git commit -m "feat: wire real page components in App.jsx (Plan 3 complete)"
```

---

## Spec Coverage Check

| Requisito da spec | Task que o implementa |
|---|---|
| PandaMascot como componente React com props `healthState`, `pageContext`, `event`, `size` | Task 2 |
| 4 estados: excellent/good/warning/critical + rim light via `--accent` | Task 2 (HEALTH_THEMES + CSS vars) |
| Animações float, breathe, zzz contínuas | Task 1 (keyframes) + Task 2 (tema.anim) |
| Eventos: mission_complete (jump), badge_earned (spin), friend_helped (wave), alert_triggered (shake), app_open (bounce-in) | Task 1 (keyframes) + Task 2 (EVENT_ANIMS) |
| Score de saúde 0–100 mapeado para 4 estados | Task 4 (calcularScore + scoreParaEstado) |
| Vitals Weather: background da UI muda com o estado | Task 8 (DashboardLayout) |
| SENTINEL: alertas, mark as read, panda 120px em postura alerta | Task 5 |
| The Chronicle: visualização mensal, densidade, navegação | Task 6 |
| Health Chains: conexões por email, eventos, contador de impacto | Task 7 |
| Dashboard: panda 270px hero | Task 9 |
| Missões: panda 160px, jump ao completar missão | Task 10 |
| Stubs substituídos pelas páginas reais | Task 11 |
