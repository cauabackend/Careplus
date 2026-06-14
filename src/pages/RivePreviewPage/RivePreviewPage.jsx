// src/pages/RivePreviewPage/RivePreviewPage.jsx
// Comparação lado a lado: Rive (novo) vs SVG (atual), com controles para
// exercitar todos os estados/poses/eventos. Rota: /rive-preview
// Enquanto /public/panda.riv não existir, o lado "Rive" cai no SVG (fallback) —
// é o esperado. Assim que o panda.riv for publicado, este painel mostra os dois.
import { useState } from 'react'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import PandaMascotRive from '../../components/PandaMascot/PandaMascotRive'

const HEALTH = ['excellent', 'good', 'warning', 'weak', 'critical']
const POSES = [
  'default', 'dashboard', 'missions-point', 'missions-dance',
  'chronicle', 'catalog', 'profile-proud', 'profile-shy',
]
const EVENTS = [
  'mission_complete', 'badge_earned', 'friend_helped',
  'alert_triggered', 'app_open', 'catalog_redeem',
]

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '0.7rem', fontWeight: 700, padding: '6px 12px',
        borderRadius: 999, cursor: 'pointer',
        border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {children}
    </button>
  )
}

function Stage({ tag, children }) {
  return (
    <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span
        style={{
          fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--accent)', alignSelf: 'flex-start',
          background: 'var(--accent-soft)', border: '1px solid var(--accent)',
          borderRadius: 999, padding: '4px 12px',
        }}
      >
        {tag}
      </span>
      <div
        className="glass"
        style={{
          borderRadius: 20, minHeight: 360, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function RivePreviewPage() {
  const [health, setHealth] = useState('good')
  const [pose, setPose] = useState('dashboard')
  const [event, setEvent] = useState(null)

  // Re-dispara o evento mudando a key (o prop event é "one-shot")
  const [evtKey, setEvtKey] = useState(0)
  const fireEvent = (ev) => {
    setEvent(ev)
    setEvtKey((k) => k + 1)
  }

  return (
    <div style={{ padding: '0 0 48px' }}>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4,
          }}
        >
          Comparação
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.025em',
          }}
        >
          Mascote — Rive vs SVG
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Sem <code>/public/panda.riv</code> ainda, o lado Rive usa o SVG (fallback). Publique o
          arquivo seguindo o <code>RIVE_SPEC.md</code> e os dois aparecem aqui.
        </p>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 64 }}>Saúde</span>
          {HEALTH.map((h) => (
            <Pill key={h} active={health === h} onClick={() => setHealth(h)}>{h}</Pill>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 64 }}>Pose</span>
          {POSES.map((p) => (
            <Pill key={p} active={pose === p} onClick={() => setPose(p)}>{p}</Pill>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 64 }}>Evento</span>
          {EVENTS.map((e) => (
            <Pill key={e} active={false} onClick={() => fireEvent(e)}>{e}</Pill>
          ))}
        </div>
      </div>

      {/* Palcos */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Stage tag="Novo · Rive">
          <PandaMascotRive
            key={`rive-${evtKey}`}
            healthState={health}
            pose={pose}
            event={event}
            size="lg"
          />
        </Stage>
        <Stage tag="Atual · SVG">
          <PandaMascot
            key={`svg-${evtKey}`}
            healthState={health}
            pose={pose}
            event={event}
            size="lg"
          />
        </Stage>
      </div>
    </div>
  )
}
