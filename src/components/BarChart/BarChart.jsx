// src/components/BarChart/BarChart.jsx
// Barras verticais finas com topo arredondado (estilo card Heart/Focus da ref).
// A barra mais recente fica em --accent cheio; as outras em acento esmaecido.
// Crescem de baixo pra cima (respeita reduced-motion).
import { motion, useReducedMotion } from 'framer-motion'

// path de barra com topo arredondado e base reta
function barPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h))
  const b = y + h
  return `M${x},${b} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${b} Z`
}

export default function BarChart({ data = [], labels = [], width = 300, height = 120, gap = 8 }) {
  const reduce = useReducedMotion()
  if (!data.length) return null

  const padBot = labels.length ? 22 : 4
  const plotH = height - padBot - 6
  const max = Math.max(...data) || 1
  const bw = (width - gap * (data.length - 1)) / data.length

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
      role="img" aria-label={`Barras de ${data.length} dias`}>
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * plotH)
        const x = i * (bw + gap)
        const y = 6 + (plotH - h)
        const recente = i === data.length - 1
        return (
          <g key={i}>
            <motion.path
              d={barPath(x, y, bw, h, Math.min(bw / 2, 5))}
              fill="var(--accent)"
              opacity={recente ? 1 : 0.32}
              style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
              initial={{ scaleY: reduce ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            />
            {labels[i] && (
              <text x={x + bw / 2} y={height - 6} textAnchor="middle"
                fill="var(--text-muted)" fontSize="9" fontWeight="600">{labels[i]}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
