// src/components/ScoreRing/ScoreRing.jsx
// Anel de score (inspirado em Oura/Wellness refs). SVG puro, sem lib de chart.
// O anel preenche conforme o score e o número conta de 0 ao valor (fonte display).
import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'

export default function ScoreRing({ score = 0, label, estadoLabel, size = 200, stroke = 9 }) {
  const reduce = useReducedMotion()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100

  // Contagem do número no centro (0 → score)
  const mv = useMotionValue(reduce ? score : 0)
  const shown = useTransform(mv, v => Math.round(v))
  useEffect(() => {
    const ctrl = animate(mv, score, { duration: reduce ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 })
    return ctrl.stop
  }, [score, mv, reduce])

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* trilho */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {/* progresso */}
        <motion.circle
          className="viz-glow"
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c * (1 - pct) : c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: reduce ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>

      {/* centro */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <motion.div style={{
            fontFamily: 'var(--font-display)', fontSize: size * 0.34, lineHeight: 1,
            color: 'var(--text-primary)',
          }}>
            {shown}
          </motion.div>
          {label && (
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
              {label}
            </div>
          )}
          {estadoLabel && (
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--accent)', marginTop: 4 }}>
              {estadoLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
