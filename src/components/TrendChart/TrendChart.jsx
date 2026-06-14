// src/components/TrendChart/TrendChart.jsx
// Linha de tendência com CURVA SUAVE (interpolação Catmull-Rom) + área em gradiente,
// rótulos de dia, linha de média tracejada e o ponto de "hoje" destacado.
// Inspirado nos cards Sleep/Wellness da referência (estilo premium, não sparkline pelado).
import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Catmull-Rom → curva bézier suave
function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0]},${p2[1].toFixed(1)}`
  }
  return d
}

export default function TrendChart({ data = [], labels = [], width = 300, height = 132, showAvg = true }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  if (data.length < 2) return null

  const padX = 12, padTop = 20, padBot = labels.length ? 24 : 10
  const max = Math.max(...data), min = Math.min(...data)
  const span = max - min || 1
  const stepX = (width - padX * 2) / (data.length - 1)
  const yOf = v => padTop + (1 - (v - min) / span) * (height - padTop - padBot)
  const pts = data.map((v, i) => [padX + i * stepX, yOf(v)])

  const line = smoothPath(pts)
  const area = `${line} L${pts[pts.length - 1][0]},${height - padBot} L${pts[0][0]},${height - padBot} Z`
  const last = pts[pts.length - 1]
  const avg = data.reduce((a, b) => a + b, 0) / data.length
  const avgY = yOf(avg)

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
      role="img" aria-label={`Tendência dos últimos ${data.length} dias`}>
      <defs>
        <linearGradient id={`tc-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* média (linha tracejada) */}
      {showAvg && (
        <line x1={padX} y1={avgY} x2={width - padX} y2={avgY}
          stroke="var(--text-faint)" strokeWidth="1" strokeDasharray="2 6" />
      )}

      {/* área */}
      <motion.path d={area} fill={`url(#tc-${uid})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.5 }} />

      {/* linha suave */}
      <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: reduce ? 0 : 1.2, ease: 'easeInOut' }} />

      {/* ponto de hoje */}
      <motion.circle className="viz-glow" cx={last[0]} cy={last[1]} r="4" fill="var(--accent)"
        initial={{ scale: reduce ? 1 : 0 }} animate={{ scale: 1 }}
        transition={{ delay: reduce ? 0 : 1.15, type: 'spring', stiffness: 380, damping: 14 }} />

      {/* rótulos de dia */}
      {labels.map((l, i) => (
        <text key={i} x={padX + i * stepX} y={height - 6} textAnchor="middle"
          fill="var(--text-muted)" fontSize="9" fontWeight="600"
          style={{ letterSpacing: '0.04em' }}>{l}</text>
      ))}
    </svg>
  )
}
