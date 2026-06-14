// src/components/PandaMascot/PandaMascotRive.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Wrapper Rive do mascote. MESMA API do PandaMascot SVG (healthState/pose/event/
// size/speechText). Enquanto /public/panda.riv não existir (ou falhar / vier
// incompleto), cai automaticamente no panda SVG atual — então o app NÃO perde
// nenhuma funcionalidade. Quando o panda.riv for publicado, este componente assume.
//
// Arquitetura em 2 componentes (de propósito):
//   PandaMascotRive  → faz o HEAD-check do arquivo; só monta o Rive se existir
//                      um .riv real. Senão (ou durante o check) renderiza o SVG.
//   RiveMascot       → onde os hooks do Rive vivem; nunca é montado em fallback,
//                      então o WASM não carrega à toa (importa no mobile).
//
// O contrato dos nomes (inputs/state machine) está em ./RIVE_SPEC.md.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-canvas'
import PandaMascot from './PandaMascot' // fallback SVG (idêntico hoje)

const SIZE_MAP = { sm: 78, md: 118, lg: 210 }
const ART_ASPECT = 448 / 300 // mesma silhueta do SVG (viewBox 300×448)

const RIV_SRC = '/panda.riv'
const STATE_MACHINE = 'Panda'

/* prop → input numérico (ver RIVE_SPEC.md §3.1) */
const HEALTH_LEVEL = { critical: 0, weak: 1, warning: 2, good: 3, excellent: 4 }
const POSE_LEVEL = {
  default: 0,
  dashboard: 1,
  'missions-point': 2,
  'missions-dance': 3,
  chronicle: 4,
  catalog: 5,
  'profile-proud': 6,
  'profile-shy': 7,
}

/* prop event → nome do trigger (ver RIVE_SPEC.md §3.2) */
const EVENT_TRIGGER = {
  mission_complete: 'evMission',
  badge_earned: 'evBadge',
  friend_helped: 'evFriend',
  alert_triggered: 'evAlert',
  app_open: 'evAppOpen',
  catalog_redeem: 'evRedeem',
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente público: decide entre Rive e SVG via HEAD-check do arquivo.
// ─────────────────────────────────────────────────────────────────────────────
export default function PandaMascotRive(props) {
  // 'checking' → ainda verificando | 'ok' → tem .riv real | 'failed' → usa SVG
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let alive = true
    fetch(RIV_SRC, { method: 'HEAD' })
      .then((r) => {
        if (!alive) return
        // 404 OU SPA devolvendo index.html (HTTP 200 text/html) = não há .riv real
        const type = r.headers.get('content-type') || ''
        setStatus(r.ok && !type.includes('text/html') ? 'ok' : 'failed')
      })
      .catch(() => {
        if (alive) setStatus('failed')
      })
    return () => {
      alive = false
    }
  }, [])

  const handleFail = useCallback(() => setStatus('failed'), [])

  // Enquanto verifica, ou sem .riv válido → SVG atual (não perde nada).
  if (status !== 'ok') {
    return <PandaMascot {...props} />
  }
  return <RiveMascot {...props} onFail={handleFail} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Subárvore Rive — só montada quando existe um .riv real.
// ─────────────────────────────────────────────────────────────────────────────
function RiveMascot({
  healthState = 'good',
  pose = 'default',
  event = null,
  size = 'md',
  speechText = null,
  onFail,
}) {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md
  const layout = useMemo(
    () => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    [],
  )

  const { rive, RiveComponent } = useRive({
    src: RIV_SRC,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout,
    onLoadError: onFail,
  })

  const healthInput = useStateMachineInput(rive, STATE_MACHINE, 'health')
  const poseInput = useStateMachineInput(rive, STATE_MACHINE, 'pose')
  const reducedInput = useStateMachineInput(rive, STATE_MACHINE, 'reducedMotion')
  const tapInput = useStateMachineInput(rive, STATE_MACHINE, 'tap')

  const evMission = useStateMachineInput(rive, STATE_MACHINE, 'evMission')
  const evBadge = useStateMachineInput(rive, STATE_MACHINE, 'evBadge')
  const evFriend = useStateMachineInput(rive, STATE_MACHINE, 'evFriend')
  const evAlert = useStateMachineInput(rive, STATE_MACHINE, 'evAlert')
  const evAppOpen = useStateMachineInput(rive, STATE_MACHINE, 'evAppOpen')
  const evRedeem = useStateMachineInput(rive, STATE_MACHINE, 'evRedeem')

  /* Watchdog: se em 4s o Rive não carregou OU faltam os inputs essenciais
     (.riv incompleto / travado em rede mobile), desiste → SVG. O timeout é
     re-armado a cada mudança; quando os inputs resolvem, a condição fica falsa. */
  useEffect(() => {
    const t = setTimeout(() => {
      if (!rive || (!healthInput && !poseInput)) onFail()
    }, 4000)
    return () => clearTimeout(t)
  }, [rive, healthInput, poseInput, onFail])

  /* healthState → input.health */
  useEffect(() => {
    if (healthInput) healthInput.value = HEALTH_LEVEL[healthState] ?? HEALTH_LEVEL.good
  }, [healthInput, healthState])

  /* pose → input.pose */
  useEffect(() => {
    if (poseInput) poseInput.value = POSE_LEVEL[pose] ?? POSE_LEVEL.default
  }, [poseInput, pose])

  /* acessibilidade → input.reducedMotion (reage a mudança em runtime) */
  useEffect(() => {
    if (!reducedInput) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      reducedInput.value = mq.matches
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [reducedInput])

  /* event → dispara o trigger correspondente quando muda */
  useEffect(() => {
    if (!event) return
    const triggers = { evMission, evBadge, evFriend, evAlert, evAppOpen, evRedeem }
    const name = EVENT_TRIGGER[event]
    triggers[name]?.fire?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  const handleTap = () => tapInput?.fire?.()
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTap()
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Balão de fala — DOM (mantido idêntico ao SVG) */}
      {speechText && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '14px',
            background: 'var(--card-bg)',
            border: '1px solid var(--accent)',
            borderRadius: '16px',
            padding: '10px 14px',
            width: '200px',
            boxShadow: '0 0 24px var(--accent-glow)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            lineHeight: 1.45,
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
            zIndex: 10,
            pointerEvents: 'none',
            animation: 'bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          {speechText}
          <div
            style={{
              position: 'absolute',
              bottom: '-7px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid var(--accent)',
            }}
          />
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Panda mascote"
        onClick={handleTap}
        onKeyDown={onKeyDown}
        style={{ display: 'inline-block', cursor: 'pointer' }}
      >
        <RiveComponent
          style={{
            width: px,
            height: px * ART_ASPECT,
            display: 'block',
            filter: 'drop-shadow(0 18px 36px rgba(0,0,20,.88))',
          }}
        />
      </div>
    </div>
  )
}
