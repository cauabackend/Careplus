// src/components/Gauge/Gauge.jsx
// Medidor radial com ticks (estilo velocímetro do card "Energy & Recovery" da ref).
// Arco de 270° com gap embaixo; ticks acendem em --accent até o valor, o resto fica
// esmaecido. Número grande em fonte display no centro. Os ticks "varrem" ao entrar.
import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'

const START = 135, SWEEP = 270  // graus (gap no rodapé)

export default function Gauge({ value = 0, label, estadoLabel, size = 200, ticks = 44 }) {
  const reduce = useReducedMotion()
  const cx = size / 2, cy = size / 2
  const R = size / 2 - 6
  const tickLen = size * 0.07
  const pct = Math.max(0, Math.min(100, value)) / 100

  // número contando no centro
  const mv = useMotionValue(reduce ? value : 0)
  const shown = useTransform(mv, v => Math.round(v))
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: reduce ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 })
    return ctrl.stop
  }, [value, mv, reduce])

  const litUpTo = Math.round(pct * (ticks - 1))

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {Array.from({ length: ticks }).map((_, i) => {
          const f = i / (ticks - 1)
          const a = (START + f * SWEEP) * Math.PI / 180
          const cos = Math.cos(a), sin = Math.sin(a)
          const lit = i <= litUpTo
          return (
            <motion.line
              key={i}
              x1={cx + R * cos} y1={cy + R * sin}
              x2={cx + (R - tickLen) * cos} y2={cy + (R - tickLen) * sin}
              stroke={lit ? 'var(--accent)' : 'rgba(255,255,255,0.10)'}
              strokeWidth={lit ? 2.4 : 2}
              strokeLinecap="round"
              className={lit ? 'viz-glow' : undefined}
              initial={lit && !reduce ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.2 + f * 1.0, duration: 0.25 }}
            />
          )
        })}
      </svg>

      <div role="img" aria-label={`${label || 'Valor'}: ${Math.round(value)} de 100${estadoLabel ? `, ${estadoLabel}` : ''}`}
        style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <motion.div style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.3, lineHeight: 1, color: 'var(--text-primary)' }}>
            {shown}
          </motion.div>
          {label && <div style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>}
          {estadoLabel && <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--accent)', marginTop: 3 }}>{estadoLabel}</div>}
        </div>
      </div>
    </div>
  )
}
