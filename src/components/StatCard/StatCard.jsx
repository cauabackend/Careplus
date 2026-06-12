// src/components/StatCard/StatCard.jsx
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

function AnimatedNumber({ target, duration = 1.2 }) {
  const mv      = useMotionValue(0)
  const rounded = useTransform(mv, v => Math.round(v).toLocaleString('pt-BR'))
  const ref     = useRef(null)

  useEffect(() => {
    const ctrl = animate(mv, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    return ctrl.stop
  }, [target, mv, duration])

  return <motion.span ref={ref}>{rounded}</motion.span>
}

export default function StatCard({ label, valor, Icone, suffix = '' }) {
  const numVal = typeof valor === 'number' ? valor : parseFloat(valor) || 0

  return (
    <motion.article
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className="glass"
      style={{
        borderRadius: '18px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: 'default',
      }}
    >
      {/* Ícone */}
      <div style={{
        width: '36px', height: '36px',
        borderRadius: '10px',
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icone size={17} strokeWidth={2} style={{ color: 'var(--accent)' }} />
      </div>

      {/* Valor */}
      <div>
        <div style={{
          fontSize: '1.45rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          <AnimatedNumber target={numVal} />
          {suffix && (
            <span style={{ fontSize: '0.9rem', fontWeight: '600', marginLeft: '2px' }}>
              {suffix}
            </span>
          )}
        </div>
        <div style={{
          fontSize: '0.62rem',
          fontWeight: '700',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: '4px',
        }}>
          {label}
        </div>
      </div>

      {/* Linha de brilho inferior */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, var(--accent), transparent)',
        opacity: 0.4,
        borderRadius: '999px',
      }} />
    </motion.article>
  )
}
