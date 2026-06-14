// src/components/PandaMascot/PandaMascot.jsx
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, useId, useCallback, useRef } from 'react'
import './PandaMascot.css'

/* sm / md foram reduzidos ~20%; lg ~22% */
const SIZE_MAP = { sm: 78, md: 118, lg: 210 }

/* ─────────────────────────────────────────────────────────────
   5 estados de saúde → parâmetros de animação
   ───────────────────────────────────────────────────────────── */
const HEALTH = {
  /* Excelente — agitado, sorriso aberto, orelhas em pé */
  excellent: {
    breathAmt: 0.062, breathDur: 1.15,
    bobAmt: 13,       bobDur: 1.5,
    floatAmt: 9,      floatDur: 1.7,
    earDy: -11,
    lidOpacity: 0,
    armSwing: true,
    /* boca bem aberta */
    mouthStroke: 'M 129 163 Q 150 186 171 163',
    mouthFill:   null,   /* interior tratado inline com elipse */
    tongue: true,
  },
  /* Bom — calmo, sorriso suave */
  good: {
    breathAmt: 0.025, breathDur: 2.8,
    bobAmt: 4,        bobDur: 4.0,
    floatAmt: 4,      floatDur: 3.5,
    earDy: -2,
    lidOpacity: 0,
    armSwing: false,
    mouthStroke: 'M 139 167 Q 150 178 161 167',
    mouthFill:   null,
    tongue: false,
  },
  /* Normal / warning — neutro, sem sorriso */
  warning: {
    breathAmt: 0.015, breathDur: 4.5,
    bobAmt: 2,        bobDur: 5.5,
    floatAmt: 2,      floatDur: 5.0,
    earDy: 4,
    lidOpacity: 0,
    armSwing: false,
    mouthStroke: 'M 140 170 L 160 170', /* linha reta neutra */
    mouthFill:   null,
    tongue: false,
  },
  /* Fraco — pálpebras pesadas, boca levemente caída, cabeça apoiada */
  weak: {
    breathAmt: 0.010, breathDur: 6.0,
    bobAmt: 1.5,      bobDur: 7.0,
    floatAmt: 1.5,    floatDur: 6.5,
    earDy: 8,
    lidOpacity: 0.48,
    armSwing: false,
    mouthStroke: 'M 140 172 Q 150 167 160 172', /* leve frown */
    mouthFill:   null,
    tongue: false,
  },
  /* Crítico — quase dormindo, zzz's, mal se mexe */
  critical: {
    breathAmt: 0.005, breathDur: 8.0,
    bobAmt: 0.5,      bobDur: 10.0,
    floatAmt: 0.5,    floatDur: 9.0,
    earDy: 13,
    lidOpacity: 0.90,
    armSwing: false,
    mouthStroke: 'M 135 174 Q 150 165 165 174', /* frown */
    mouthFill:   null,
    tongue: false,
  },
}

/* ─── Animações one-shot de evento ─────────────────────────── */
const EVENT_ANIM = {
  mission_complete: { y: [0, -42, -18, -34, 0] },
  badge_earned:     { rotate: [0, 360], scale: [1, 1.12, 1] },
  friend_helped:    { x: [0, -9, 9, -9, 9, 0] },
  alert_triggered:  { x: [0, -7, 7, -7, 7, 0] },
  app_open:         { scale: [0.2, 1.18, 0.90, 1.06, 1] },
  catalog_redeem:   { y: [0, -56, -22, -46, 0] },
}
const EVENT_DUR = {
  mission_complete: 720,  badge_earned: 950, friend_helped: 1100,
  alert_triggered: 620,   app_open: 1100,   catalog_redeem: 920,
}

/* ─── Reação ao toque (por estado de saúde) ─────────────────── */
const TAP_ANIM = {
  excellent: { y: [0, -32, 6, -14, 0] },
  good:      { y: [0, -20, 3,  -8, 0] },
  warning:   { rotate: [0, -7, 7, -4, 4, 0] },
  weak:      { y: [0, -10, 1,  -4, 0] },
  critical:  { scale: [1, 1.20, 0.86, 1.08, 1] }, /* startled wake */
}
const TAP_DUR = 650

export default function PandaMascot({
  healthState = 'good',
  pose        = 'default',
  event       = null,
  size        = 'md',
  speechText  = null,
}) {
  const rawId = useId()
  const uid   = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const reduce = useReducedMotion()

  const [activeEvent,  setActiveEvent]  = useState(null)
  const [blinkClosed,  setBlinkClosed]  = useState(false)
  const [tapped,       setTapped]       = useState(false)
  const [glanceDir,    setGlanceDir]    = useState(0)    // -1 | 0 | 1
  const [yawning,      setYawning]      = useState(false)
  const [critStartle,  setCritStartle]  = useState(false)
  const [track,        setTrack]        = useState({ x: 0, y: 0 }) // olho segue cursor

  const wrapRef = useRef(null)
  const rafRef  = useRef(0)

  const h  = HEALTH[healthState] ?? HEALTH.good
  const px = SIZE_MAP[size] ?? SIZE_MAP.md

  /* one-shot events */
  useEffect(() => {
    if (!event) return
    setActiveEvent(event)
    const t = setTimeout(() => setActiveEvent(null), EVENT_DUR[event] ?? 1000)
    return () => clearTimeout(t)
  }, [event])

  /* slow blink — Chronicle */
  useEffect(() => {
    if (pose !== 'chronicle') { setBlinkClosed(false); return }
    const id = setInterval(() => {
      setBlinkClosed(true)
      setTimeout(() => setBlinkClosed(false), 360)
    }, 3800)
    return () => clearInterval(id)
  }, [pose])

  /* side glance — Normal/warning state */
  useEffect(() => {
    if (healthState !== 'warning') { setGlanceDir(0); return }
    let t
    const tick = () => {
      setGlanceDir(d => d !== 0 ? 0 : (Math.random() > 0.5 ? 1 : -1))
      t = setTimeout(tick, 2800 + Math.random() * 3200)
    }
    t = setTimeout(tick, 3000 + Math.random() * 2000)
    return () => clearTimeout(t)
  }, [healthState])

  /* yawn — Normal/warning state */
  useEffect(() => {
    if (healthState !== 'warning') { setYawning(false); return }
    let t
    const tick = () => {
      setYawning(true)
      setTimeout(() => setYawning(false), 1100)
      t = setTimeout(tick, 7000 + Math.random() * 6000)
    }
    t = setTimeout(tick, 5000 + Math.random() * 4000)
    return () => clearTimeout(t)
  }, [healthState])

  /* olhos seguem o cursor (pointer) — desligado em reduced-motion.
     Usa rAF pra não re-renderizar a cada evento de mouse. */
  useEffect(() => {
    if (reduce || typeof window === 'undefined') return
    const onMove = (e) => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const el = wrapRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (!r.width) return
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth  / 2)))
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)))
        const tx = +(nx * 5).toFixed(1)
        const ty = +(ny * 4).toFixed(1)
        // bail-out: só re-renderiza quando o alvo (arredondado) muda de fato
        setTrack(prev => (prev.x === tx && prev.y === ty ? prev : { x: tx, y: ty }))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [reduce])

  /* tap / touch reaction — PRESENTE EM TODOS OS ESTADOS */
  const handleTap = useCallback(() => {
    if (tapped) return
    setTapped(true)
    if (healthState === 'critical') {
      setCritStartle(true)
      setTimeout(() => setCritStartle(false), 1400)
    }
    setTimeout(() => setTapped(false), TAP_DUR)
  }, [tapped, healthState])

  /* ── Pose flags ─────────────────────────────────────────── */
  const isDashboard = pose === 'dashboard'
  const isPointing  = pose === 'missions-point'
  const isDancing   = pose === 'missions-dance'
  const isChronicle = pose === 'chronicle'
  const isCatalog   = pose === 'catalog'
  const isProud     = pose === 'profile-proud'
  const isShy       = pose === 'profile-shy'
  const isWeak      = healthState === 'weak'
  const isCritical  = healthState === 'critical'
  const isLookUp    = isDashboard && activeEvent === 'app_open'

  /* ── Clip-path / gradiente IDs únicos por instância ─────── */
  const ID = {
    gs:'gs-'+uid, bd:'bd-'+uid, hd:'hd-'+uid, la:'la-'+uid,
    ra:'ra-'+uid, le:'le-'+uid, re:'re-'+uid, ll:'ll-'+uid,
    rl:'rl-'+uid, epL:'epl-'+uid, epR:'epr-'+uid, mz:'mz-'+uid,
    /* gradientes / filtro 3D */
    headG:'hg-'+uid, capeG:'cg-'+uid, bellyG:'blg-'+uid,
    limbG:'lg2-'+uid, earG:'eg-'+uid, earIn:'ei-'+uid,
    patchG:'pg-'+uid, soft:'sf-'+uid,
  }

  /* ── Braços ─────────────────────────────────────────────── */
  const leftArmRot  = isDancing ? [0, 30, 0]
    : isProud   ? -18
    : isShy     ?  20
    : isWeak    ?  10
    : h.armSwing ? [0, -12, 0]
    : 0

  const rightArmRot = isPointing ? -58
    : isDancing ? [0, -30, 0]
    : isProud   ? 18
    : isShy     ? -20
    : isWeak    ? -70   /* braço levantado apoiando a cabeça */
    : h.armSwing ? [0, 12, 0]
    : 0

  const loopArms = (isDancing || h.armSwing) && !reduce
  const armDur   = isDancing ? 0.52 : 2.2

  /* ── Cabeça ─────────────────────────────────────────────── */
  const headYArr = reduce ? 0 : isChronicle
    ? [0, h.bobAmt * 0.3, 0]
    : isDashboard
    ? [-h.bobAmt * 0.5, h.bobAmt * 0.5, -h.bobAmt * 0.5]
    : [-h.bobAmt, h.bobAmt, -h.bobAmt]

  /* inclinação: weak inclina pro braço, chronicle balança, outros fixos */
  const headRotate = isWeak ? (reduce ? 8 : [6, 10, 6])
    : reduce ? 0
    : isChronicle ? [-2, 2, -2]
    : 0

  /* ── Pupilas (glance + lookup + segue cursor) ───────────── */
  const pupilDy = (isLookUp ? -9 : 0) + track.y
  const pupilDx = glanceDir * 5 + track.x

  /* ── Boca ───────────────────────────────────────────────── */
  /* bocejo sobrescreve a boca do warning */
  const activeMouthStroke = yawning
    ? 'M 133 163 Q 150 189 167 163'
    : h.mouthStroke
  const activeMouthFill = yawning
    ? 'M 133 163 Q 150 189 167 163 Q 160 184 140 184 Z'
    : h.mouthFill

  /* ── Pálpebras ───────────────────────────────────────────── */
  /* critical startled → abre; yawning → semicerra */
  const activeLidOpacity = critStartle
    ? 0.08
    : yawning
    ? Math.max(h.lidOpacity, 0.30)
    : h.lidOpacity

  /* ── Animação externa (float / event / tap) ─────────────── */
  let outerAnim, outerTransition
  if (tapped) {
    outerAnim       = TAP_ANIM[healthState] ?? TAP_ANIM.good
    outerTransition = { duration: TAP_DUR / 1000, ease: 'easeOut' }
  } else if (activeEvent && EVENT_ANIM[activeEvent]) {
    outerAnim       = EVENT_ANIM[activeEvent]
    outerTransition = { duration: EVENT_DUR[activeEvent] / 1000, ease: 'easeOut' }
  } else if (reduce) {
    outerAnim       = { y: 0 }
    outerTransition = { duration: 0.3 }
  } else {
    outerAnim       = { y: [-h.floatAmt, h.floatAmt, -h.floatAmt] }
    outerTransition = { duration: h.floatDur, repeat: Infinity, ease: 'easeInOut' }
  }

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={handleTap}
    >
      {/* ── Balão de fala ───────────────────────────────────── */}
      {speechText && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)', marginBottom: '14px',
          background: 'var(--card-bg)', border: '1px solid var(--accent)',
          borderRadius: '16px', padding: '10px 14px', width: '200px',
          boxShadow: '0 0 24px var(--accent-glow)', color: 'var(--text-primary)',
          fontSize: '0.75rem', lineHeight: 1.45, textAlign: 'center',
          backdropFilter: 'blur(20px)', zIndex: 10, pointerEvents: 'none',
          animation: 'bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {speechText}
          <div style={{
            position: 'absolute', bottom: '-7px', left: '50%',
            transform: 'translateX(-50%)', width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderTop: '7px solid var(--accent)',
          }} />
        </div>
      )}

      {/* ── Wrapper tímido (perfil sem badges) ──────────────── */}
      <motion.div
        animate={{ scale: isShy ? 0.87 : 1 }}
        transition={{ duration: 0.5 }}
        whileTap={{ scale: isShy ? 0.82 : 0.94 }}
        style={{ display: 'inline-block', cursor: 'pointer' }}
      >
        {/* ── Float / event / tap ─────────────────────────── */}
        <motion.div
          animate={outerAnim}
          transition={outerTransition}
          style={{
            display: 'inline-block',
            filter: 'drop-shadow(0 18px 36px rgba(0,0,20,.88))',
          }}
        >
          <svg
            viewBox="0 0 300 448"
            width={px}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-label="Panda mascote"
            role="img"
          >
            <defs>
              <radialGradient id={ID.gs} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(0,0,0,.55)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>

              {/* ── Gradientes de volume (luz vinda de cima-esquerda) ── */}
              <radialGradient id={ID.headG} cx="38%" cy="30%" r="78%">
                <stop offset="0%"   stopColor="#FFFFFF" />
                <stop offset="55%"  stopColor="#F3F0EB" />
                <stop offset="100%" stopColor="#D8D3CB" />
              </radialGradient>
              <radialGradient id={ID.bellyG} cx="50%" cy="36%" r="70%">
                <stop offset="0%"   stopColor="#FFFFFF" />
                <stop offset="68%"  stopColor="#F1EEE8" />
                <stop offset="100%" stopColor="#D9D3CA" />
              </radialGradient>
              <linearGradient id={ID.capeG} x1="0" y1="0" x2="0.15" y2="1">
                <stop offset="0%"   stopColor="#3A3A46" />
                <stop offset="50%"  stopColor="#20202A" />
                <stop offset="100%" stopColor="#141019" />
              </linearGradient>
              <linearGradient id={ID.limbG} x1="0.1" y1="0" x2="0.5" y2="1">
                <stop offset="0%"   stopColor="#35353F" />
                <stop offset="58%"  stopColor="#1E1E27" />
                <stop offset="100%" stopColor="#121119" />
              </linearGradient>
              <radialGradient id={ID.earG} cx="42%" cy="35%" r="72%">
                <stop offset="0%"   stopColor="#35353F" />
                <stop offset="100%" stopColor="#16161D" />
              </radialGradient>
              <radialGradient id={ID.earIn} cx="50%" cy="48%" r="58%">
                <stop offset="0%"   stopColor="#F6BD91" />
                <stop offset="60%"  stopColor="#E8A87C" />
                <stop offset="100%" stopColor="#C8825A" />
              </radialGradient>
              <radialGradient id={ID.patchG} cx="42%" cy="33%" r="74%">
                <stop offset="0%"   stopColor="#2C2C36" />
                <stop offset="100%" stopColor="#0E0E15" />
              </radialGradient>
              <filter id={ID.soft} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>

              <clipPath id={ID.bd}><rect x="54" y="212" width="192" height="182" rx="58" ry="54" /></clipPath>
              <clipPath id={ID.hd}><circle cx="150" cy="112" r="94" /></clipPath>
              <clipPath id={ID.la}><rect x="10" y="228" width="58" height="90" rx="28" transform="rotate(-12,39,273)" /></clipPath>
              <clipPath id={ID.ra}><rect x="232" y="228" width="58" height="90" rx="28" transform="rotate(12,261,273)" /></clipPath>
              <clipPath id={ID.le}><circle cx="68"  cy="40" r="26" /></clipPath>
              <clipPath id={ID.re}><circle cx="232" cy="40" r="26" /></clipPath>
              <clipPath id={ID.ll}><rect x="84"  y="368" width="60" height="52" rx="26" /></clipPath>
              <clipPath id={ID.rl}><rect x="156" y="368" width="60" height="52" rx="26" /></clipPath>
              <clipPath id={ID.epL}><ellipse cx="107" cy="118" rx="37" ry="31" transform="rotate(-8,107,118)" /></clipPath>
              <clipPath id={ID.epR}><ellipse cx="193" cy="118" rx="37" ry="31" transform="rotate(8,193,118)" /></clipPath>
              <clipPath id={ID.mz}><ellipse cx="150" cy="162" rx="34" ry="23" /></clipPath>
            </defs>

            {/* Sombra no chão (com blur suave) */}
            <ellipse cx="150" cy="440" rx="88" ry="10" fill={`url(#${ID.gs})`} filter={`url(#${ID.soft})`} />

            {/* ── Orelhas ──────────────────────────────────── */}
            <motion.g
              animate={{ y: reduce ? 0 : [0, h.earDy, 0] }}
              transition={{ duration: h.bobDur, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
            >
              <circle cx="68"  cy="40" r="26" fill={`url(#${ID.earG})`} stroke="#0D0C1A" strokeWidth="4" />
              <ellipse cx="68" cy="44" rx="11" ry="12" fill={`url(#${ID.earIn})`} />
              <ellipse cx="63" cy="33" rx="9" ry="5" fill="rgba(255,255,255,.16)" clipPath={`url(#${ID.le})`} />
              <circle cx="46"  cy="40" r="23" className="panda-rl" clipPath={`url(#${ID.le})`} />

              <circle cx="232" cy="40" r="26" fill={`url(#${ID.earG})`} stroke="#0D0C1A" strokeWidth="4" />
              <ellipse cx="232" cy="44" rx="11" ry="12" fill={`url(#${ID.earIn})`} />
              <ellipse cx="237" cy="33" rx="9" ry="5" fill="rgba(255,255,255,.16)" clipPath={`url(#${ID.re})`} />
            </motion.g>

            {/* ── Pernas ───────────────────────────────────── */}
            {isDashboard ? (
              /* Dashboard: perninhas balançando pra fora */
              <>
                <motion.g
                  style={{ transformOrigin: '114px 368px' }}
                  animate={{ rotate: reduce ? 0 : [-12, 12, -12] }}
                  transition={{ duration: 1.7, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
                >
                  <rect x="84"  y="368" width="60" height="52" rx="26" fill={`url(#${ID.limbG})`} stroke="#0D0C1A" strokeWidth="4" />
                  <ellipse cx="114" cy="377" rx="18" ry="6" fill="rgba(255,255,255,.14)" clipPath={`url(#${ID.ll})`} />
                  <rect x="84"  y="368" width="26" height="52" rx="22" className="panda-rl" clipPath={`url(#${ID.ll})`} />
                </motion.g>
                <motion.g
                  style={{ transformOrigin: '186px 368px' }}
                  animate={{ rotate: reduce ? 0 : [12, -12, 12] }}
                  transition={{ duration: 1.7, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
                >
                  <rect x="156" y="368" width="60" height="52" rx="26" fill={`url(#${ID.limbG})`} stroke="#0D0C1A" strokeWidth="4" />
                  <ellipse cx="186" cy="377" rx="18" ry="6" fill="rgba(255,255,255,.14)" clipPath={`url(#${ID.rl})`} />
                </motion.g>
              </>
            ) : (
              /* Demais poses: pernas estáticas */
              <>
                <rect x="84"  y="368" width="60" height="52" rx="26" fill={`url(#${ID.limbG})`} stroke="#0D0C1A" strokeWidth="4" />
                <ellipse cx="114" cy="377" rx="18" ry="6" fill="rgba(255,255,255,.14)" clipPath={`url(#${ID.ll})`} />
                <rect x="84"  y="368" width="26" height="52" rx="22" className="panda-rl" clipPath={`url(#${ID.ll})`} />
                <rect x="156" y="368" width="60" height="52" rx="26" fill={`url(#${ID.limbG})`} stroke="#0D0C1A" strokeWidth="4" />
                <ellipse cx="186" cy="377" rx="18" ry="6" fill="rgba(255,255,255,.14)" clipPath={`url(#${ID.rl})`} />
              </>
            )}

            {/* ── Corpo / barriga (respira) ─────────────────── */}
            <motion.g
              style={{ transformOrigin: '152px 294px' }}
              animate={{ scaleY: reduce ? 1 : [1, 1 + h.breathAmt, 1] }}
              transition={{ duration: h.breathDur, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
            >
              <rect x="54" y="212" width="192" height="182" rx="58" ry="54" fill={`url(#${ID.capeG})`} stroke="#0D0C1A" strokeWidth="4" />
              <rect x="54" y="212" width="88"  height="182" rx="56" ry="54" className="panda-rl" clipPath={`url(#${ID.bd})`} />
              <ellipse cx="150" cy="220" rx="56" ry="11" fill="rgba(255,255,255,.10)" clipPath={`url(#${ID.bd})`} />
              <ellipse cx="152" cy="294" rx="70" ry="80" fill={`url(#${ID.bellyG})`} stroke="#0D0C1A" strokeWidth="3" />
              <ellipse cx="152" cy="232" rx="58" ry="20" fill="rgba(0,0,0,.10)" clipPath={`url(#${ID.bd})`} />
              <ellipse cx="152" cy="362" rx="46" ry="16" fill="rgba(0,0,0,.07)" clipPath={`url(#${ID.bd})`} />
            </motion.g>

            {/* ── Braço esquerdo ───────────────────────────── */}
            <motion.g
              style={{ transformOrigin: '39px 245px' }}
              animate={{ rotate: reduce && Array.isArray(leftArmRot) ? 0 : leftArmRot }}
              transition={loopArms
                ? { duration: armDur, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.45 }
              }
            >
              <rect x="10" y="228" width="58" height="90" rx="28" transform="rotate(-12,39,273)" fill={`url(#${ID.limbG})`} stroke="#0D0C1A" strokeWidth="4" />
              <rect x="10" y="228" width="28" height="90" rx="22" transform="rotate(-12,39,273)" className="panda-rl" clipPath={`url(#${ID.la})`} />
              <rect x="56" y="233" width="8"  height="80" rx="4"  transform="rotate(-12,60,273)" fill="rgba(255,255,255,.14)" clipPath={`url(#${ID.la})`} />
            </motion.g>

            {/* ── Braço direito ─────────────────────────────── */}
            <motion.g
              style={{ transformOrigin: '261px 245px' }}
              animate={{ rotate: reduce && Array.isArray(rightArmRot) ? 0 : rightArmRot }}
              transition={loopArms && !isPointing
                ? { duration: armDur, repeat: Infinity, ease: 'easeInOut', delay: isDancing ? 0.26 : 0 }
                : { duration: 0.55 }
              }
            >
              <rect x="232" y="228" width="58" height="90" rx="28" transform="rotate(12,261,273)" fill={`url(#${ID.limbG})`} stroke="#0D0C1A" strokeWidth="4" />
              <rect x="262" y="228" width="28" height="90" rx="22" transform="rotate(12,261,273)" className="panda-rl" clipPath={`url(#${ID.ra})`} />
              <rect x="236" y="233" width="8"  height="80" rx="4"  transform="rotate(12,240,273)" fill="rgba(255,255,255,.14)" clipPath={`url(#${ID.ra})`} />
            </motion.g>

            {/* ── Cabeça ────────────────────────────────────── */}
            <motion.g
              style={{ transformOrigin: '150px 112px' }}
              animate={{ y: headYArr, rotate: headRotate }}
              transition={{ duration: h.bobDur, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
            >
              {/* Cabeça base */}
              <circle cx="150" cy="112" r="94" fill={`url(#${ID.headG})`} stroke="#0D0C1A" strokeWidth="4" />
              <ellipse cx="184" cy="66" rx="24" ry="15" fill="rgba(255,255,255,.60)" clipPath={`url(#${ID.hd})`} />
              <ellipse cx="188" cy="62" rx="10" ry="6"  fill="rgba(255,255,255,.90)" clipPath={`url(#${ID.hd})`} />
              {/* Sombra de oclusão na base da cabeça */}
              <ellipse cx="150" cy="196" rx="62" ry="20" fill="rgba(0,0,0,.12)" clipPath={`url(#${ID.hd})`} />
              {/* Sombra do pescoço */}
              <ellipse cx="150" cy="200" rx="38" ry="8" fill="rgba(0,0,0,.17)" />

              {/* Manchas dos olhos */}
              <ellipse cx="107" cy="118" rx="37" ry="31" transform="rotate(-8,107,118)" fill={`url(#${ID.patchG})`} stroke="#0D0C1A" strokeWidth="3" />
              <ellipse cx="100" cy="103" rx="15" ry="7"  transform="rotate(-8,100,103)" fill="rgba(255,255,255,.16)" clipPath={`url(#${ID.epL})`} />
              <ellipse cx="193" cy="118" rx="37" ry="31" transform="rotate(8,193,118)"  fill={`url(#${ID.patchG})`} stroke="#0D0C1A" strokeWidth="3" />
              <ellipse cx="200" cy="103" rx="15" ry="7"  transform="rotate(8,200,103)"  fill="rgba(255,255,255,.16)" clipPath={`url(#${ID.epR})`} />

              {/* Brancos dos olhos */}
              <circle cx="107" cy="119" r="19" fill="#FFFFFF" />
              <circle cx="193" cy="119" r="19" fill="#FFFFFF" />

              {/* Pupila esquerda */}
              <circle cx={110 + pupilDx} cy={121 + pupilDy} r="13" fill="#2C1F10" />
              <circle cx={110 + pupilDx} cy={121 + pupilDy} r="8"  fill="#08071A" />
              <circle cx={117 + pupilDx} cy={112 + pupilDy} r="6"  fill="#FFFFFF" />
              <circle cx={104 + pupilDx} cy={128 + pupilDy} r="2.5" fill="rgba(255,255,255,.6)" />

              {/* Pupila direita */}
              <circle cx={190 + pupilDx} cy={121 + pupilDy} r="13" fill="#2C1F10" />
              <circle cx={190 + pupilDx} cy={121 + pupilDy} r="8"  fill="#08071A" />
              <circle cx={183 + pupilDx} cy={112 + pupilDy} r="6"  fill="#FFFFFF" />
              <circle cx={196 + pupilDx} cy={128 + pupilDy} r="2.5" fill="rgba(255,255,255,.6)" />

              {/* Brilho extra — catálogo */}
              {isCatalog && (
                <>
                  <circle cx="99"  cy="112" r="5.5" fill="rgba(255,255,255,0.95)" />
                  <circle cx="96"  cy="118" r="2.8" fill="rgba(255,255,255,0.7)" />
                  <circle cx="185" cy="112" r="5.5" fill="rgba(255,255,255,0.95)" />
                  <circle cx="188" cy="118" r="2.8" fill="rgba(255,255,255,0.7)" />
                </>
              )}

              {/* Pálpebras (weak / critical / bocejo) */}
              {activeLidOpacity > 0 && (
                <g opacity={activeLidOpacity}>
                  <ellipse cx="107" cy="111" rx="21" ry="14" fill="#1A1828" />
                  <ellipse cx="193" cy="111" rx="21" ry="14" fill="#1A1828" />
                </g>
              )}

              {/* Piscada lenta — Chronicle */}
              {blinkClosed && (
                <g>
                  <ellipse cx="107" cy="119" rx="21" ry="20" fill="#1A1828" />
                  <ellipse cx="193" cy="119" rx="21" ry="20" fill="#1A1828" />
                </g>
              )}

              {/* Bochechas */}
              <ellipse cx="88"  cy="160" rx="13" ry="8" fill="rgba(255,110,135,.40)" />
              <ellipse cx="212" cy="160" rx="13" ry="8" fill="rgba(255,110,135,.40)" />

              {/* Focinho */}
              <ellipse cx="150" cy="162" rx="34" ry="23" fill="#EDECEA" stroke="#B8B5B0" strokeWidth="1.5" />
              <ellipse cx="150" cy="150" rx="28" ry="8"  fill="rgba(0,0,0,.07)" clipPath={`url(#${ID.mz})`} />
              <line x1="150" y1="162" x2="150" y2="172" stroke="#C0BCBA" strokeWidth="1.2" />

              {/* Nariz */}
              <ellipse cx="150" cy="154" rx="12" ry="8" fill="#1A1828" />
              <ellipse cx="146" cy="151" rx="4"  ry="2.5" fill="rgba(255,255,255,.42)" />
              <circle  cx="145" cy="158" r="1.8" fill="#0D0C18" />
              <circle  cx="155" cy="158" r="1.8" fill="#0D0C18" />

              {/* Boca */}
              {healthState === 'excellent' ? (
                /*
                  Boca aberta — bezier Q com controle em y=204 →
                  ponto real do arco em t=0.5: y = 0.25×163 + 0.5×204 + 0.25×163 ≈ 183.5
                  Língua em cy=178 fica claramente dentro da abertura.
                */
                <>
                  {/* Cavidade escura */}
                  <path
                    d="M 128 163 Q 150 204 172 163 Z"
                    fill="rgba(14,4,4,.90)"
                  />
                  {/* Dentinhos */}
                  <line
                    x1="132" y1="166" x2="168" y2="166"
                    stroke="rgba(255,255,255,.75)" strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Língua — dentro do arco (cy=178 < 183.5) */}
                  <ellipse cx="150" cy="178" rx="10" ry="5" fill="rgba(205,60,80,.75)" />
                  {/* Contorno dos lábios */}
                  <path
                    d="M 128 163 Q 150 204 172 163"
                    stroke="#1A1828" strokeWidth="2.8" fill="none"
                  />
                </>
              ) : (
                <>
                  {activeMouthFill && (
                    <path d={activeMouthFill} fill="rgba(20,8,8,.72)" />
                  )}
                  <path d={activeMouthStroke} stroke="#1A1828" strokeWidth="2.8" fill="none" />
                </>
              )}

              {/* ZZZ's — critical (some peeking through startle) */}
              {isCritical && (
                <g opacity={critStartle ? 0 : 1} style={{ transition: 'opacity 0.4s' }}>
                  <text
                    x="176" y="84"
                    fontFamily="Plus Jakarta Sans,sans-serif"
                    fontSize="22" fontWeight="800"
                    fill="rgba(255,255,255,.85)"
                    style={{ animation: 'panda-zzz 2.5s ease-in-out infinite' }}
                  >z</text>
                  <text
                    x="196" y="64"
                    fontFamily="Plus Jakarta Sans,sans-serif"
                    fontSize="15" fontWeight="700"
                    fill="rgba(255,255,255,.50)"
                    style={{ animation: 'panda-zzz2 2.5s ease-in-out infinite 0.65s' }}
                  >z</text>
                </g>
              )}
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
