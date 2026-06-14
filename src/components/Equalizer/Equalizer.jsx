// src/components/Equalizer/Equalizer.jsx
// Waveform de barras finas (estilo card "Focus Activity" da ref): muitas barras
// verticais centradas, uma posição destacada em --accent com linha-marcador.
import { motion, useReducedMotion } from 'framer-motion'

export default function Equalizer({ data = [], width = 300, height = 84, highlight }) {
  const reduce = useReducedMotion()
  if (!data.length) return null

  const n = data.length
  const slot = width / n
  const bw = Math.max(1.5, slot * 0.42)
  const mid = height / 2
  const maxHalf = height / 2 - 4
  const hi = highlight == null ? Math.floor(n / 2) : highlight

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {/* linha-marcador do destaque */}
      <line x1={hi * slot + slot / 2} y1="2" x2={hi * slot + slot / 2} y2={height - 2}
        stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />

      {data.map((v, i) => {
        const half = Math.max(1.5, Math.min(1, v) * maxHalf)
        const x = i * slot + (slot - bw) / 2
        const destaque = i === hi
        return (
          <motion.rect
            key={i}
            x={x} y={mid - half} width={bw} height={half * 2} rx={bw / 2}
            fill="var(--accent)"
            opacity={destaque ? 1 : 0.28}
            className={destaque ? 'viz-glow' : undefined}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={{ scaleY: reduce ? 1 : 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : i * 0.012, ease: [0.16, 1, 0.3, 1] }}
          />
        )
      })}
    </svg>
  )
}
