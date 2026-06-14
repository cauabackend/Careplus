// src/components/Sparkline/Sparkline.jsx
// Mini-gráfico de linha (tendência), sem eixos/grid — só a forma do dado.
// Linha desenha animada (pathLength) + área sutil sob a curva.
import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function Sparkline({ data = [], width = 280, height = 56, pad = 6 }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const stepX = (width - pad * 2) / (data.length - 1 || 1)

  const pts = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (v - min) / span) * (height - pad * 2)
    return [x, y]
  })

  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height - pad} L${pts[0][0].toFixed(1)},${height - pad} Z`
  const last = pts[pts.length - 1]

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id={`sl-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area} fill={`url(#sl-${uid})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.6 }}
      />
      <motion.path
        d={line} fill="none" stroke="var(--accent)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: reduce ? 0 : 1.1, ease: 'easeInOut' }}
      />
      <motion.circle
        className="viz-glow"
        cx={last[0]} cy={last[1]} r="3.5" fill="var(--accent)"
        initial={{ scale: reduce ? 1 : 0 }} animate={{ scale: 1 }}
        transition={{ delay: reduce ? 0 : 1.05, type: 'spring', stiffness: 400, damping: 14 }}
      />
    </svg>
  )
}
