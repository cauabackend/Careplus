// src/components/CalendarHeatmap/CalendarHeatmap.jsx
// Heatmap de calendário alinhado por semana (GitHub-style) com a paleta do Vitals
// Weather. Também serve como o "block chart" de densidade da referência: quadradinhos
// arredondados cuja intensidade (opacidade do --accent) reflete o valor do dia.
import { motion, useReducedMotion } from 'framer-motion'

const LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']  // domingo → sábado

// Paleta do Vitals Weather por nível de saúde do dia (1 = crítico … 5 = excelente).
const CORES_NIVEL = {
  1: '#F0564E', // critical — vermelho
  2: '#A89ED6', // weak     — roxo
  3: '#E8A44A', // warning  — âmbar
  4: '#4ECC8A', // good     — verde
  5: '#5BC8FF', // excellent— ciano
}

export default function CalendarHeatmap({
  values = [],          // 0..1 por dia do mês (intensidade do --accent)
  niveis = null,        // alternativa: 0 (inativo) ou 1..5 (estado de saúde do dia)
  startWeekday = 0,     // 0 = domingo
  cell = 26,
  gap = 6,
  showLabels = true,
}) {
  const reduce = useReducedMotion()
  const usaNiveis = Array.isArray(niveis)
  const itens = usaNiveis ? niveis : values
  const cols = 7
  const total = startWeekday + itens.length
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

      {itens.map((v, i) => {
        const slot = startWeekday + i
        const col = slot % cols
        const row = Math.floor(slot / cols)
        const x = col * (cell + gap)
        const y = labelH + row * (cell + gap)

        // Define cor + opacidade conforme o modo (níveis coloridos ou intensidade).
        let fill, op
        if (usaNiveis) {
          const nivel = Math.max(0, Math.min(5, Math.round(v)))
          fill = nivel > 0 ? CORES_NIVEL[nivel] : 'rgba(255,255,255,0.06)'
          op   = nivel > 0 ? 0.55 + nivel * 0.09 : 1   // 0.64 → 1.0
        } else {
          const intensity = Math.max(0, Math.min(1, v))
          fill = intensity > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.06)'
          op   = intensity > 0 ? 0.18 + intensity * 0.82 : 1
        }

        return (
          <motion.rect
            key={i}
            x={x} y={y} width={cell} height={cell} rx="6"
            fill={fill}
            opacity={op}
            initial={{ scale: reduce ? 1 : 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: op }}
            transition={{ delay: reduce ? 0 : i * 0.012, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )
      })}
    </svg>
  )
}
