// src/components/DashedPath/DashedPath.jsx
// Motivo de assinatura (inspirado na ref Wellness): caminho curvo tracejado
// conectando elementos. O traço "flui" suavemente; respeita reduced-motion.
import { motion, useReducedMotion } from 'framer-motion'

export default function DashedPath({
  d,
  width = 280,
  height = 80,
  draw = true,        // anima o desenho do traço ao montar
  flow = false,       // anima um fluxo contínuo no tracejado
}) {
  const reduce = useReducedMotion()

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
      <motion.path
        d={d}
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 7"
        opacity="0.65"
        initial={draw && !reduce ? { pathLength: 0 } : { pathLength: 1 }}
        animate={
          flow && !reduce
            ? { pathLength: 1, strokeDashoffset: [0, -18] }
            : { pathLength: 1 }
        }
        transition={
          flow && !reduce
            ? { pathLength: { duration: 1 }, strokeDashoffset: { duration: 1.1, repeat: Infinity, ease: 'linear' } }
            : { duration: reduce ? 0 : 1 }
        }
      />
    </svg>
  )
}
