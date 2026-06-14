// src/components/CalendarHeatmap/CalendarHeatmap.jsx
// Heatmap de calendário alinhado por semana (GitHub-style) com a paleta do Vitals
// Weather. Também serve como o "block chart" de densidade da referência: quadradinhos
// arredondados cuja intensidade (opacidade do --accent) reflete o valor do dia.
import { motion, useReducedMotion } from 'framer-motion'

const LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']  // domingo → sábado

export default function CalendarHeatmap({
  values = [],          // 0..1 por dia do mês
  startWeekday = 0,     // 0 = domingo
  cell = 26,
  gap = 6,
  showLabels = true,
}) {
  const reduce = useReducedMotion()
  const cols = 7
  const total = startWeekday + values.length
  const rows = Math.ceil(total / cols)
  const width = cols * cell + (cols - 1) * gap
  const labelH = showLabels ? 16 : 0
  const height = rows * cell + (rows - 1) * gap + labelH

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {showLabels && LABELS.map((l, i) => (
        <text key={`l${i}`} x={i * (cell + gap) + cell / 2} y={11} textAnchor="middle"
          fill="var(--text-muted)" fontSize="9" fontWeight="700">{l}</text>
      ))}

      {values.map((v, i) => {
        const slot = startWeekday + i
        const col = slot % cols
        const row = Math.floor(slot / cols)
        const x = col * (cell + gap)
        const y = labelH + row * (cell + gap)
        const intensity = Math.max(0, Math.min(1, v))
        const fill = intensity > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.06)'
        return (
          <motion.rect
            key={i}
            x={x} y={y} width={cell} height={cell} rx="6"
            fill={fill}
            opacity={intensity > 0 ? 0.18 + intensity * 0.82 : 1}
            initial={{ scale: reduce ? 1 : 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: intensity > 0 ? 0.18 + intensity * 0.82 : 1 }}
            transition={{ delay: reduce ? 0 : i * 0.012, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )
      })}
    </svg>
  )
}
