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
      whileHover={{ y: -2, borderColor: 'var(--accent)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className="glass rounded-lg flex flex-col gap-3 py-4 px-[18px] cursor-default"
      style={{
        boxShadow: 'var(--shadow-1)',
      }}
    >
      {/* Ícone plano (sem caixinha) + label na mesma linha */}
      <div className="flex items-center gap-[7px]">
        <Icone size={15} strokeWidth={1.6} style={{ color: 'var(--accent)' }} />
        <span className="text-[0.62rem] font-bold tracking-[0.16em] uppercase text-[var(--text-muted)]">
          {label}
        </span>
      </div>

      {/* Valor em fonte de display */}
      <div className="text-[2.1rem] font-normal text-[var(--text-primary)] tracking-[0] leading-[0.95]" style={{
        fontFamily: 'var(--font-display)',
      }}>
        <AnimatedNumber target={numVal} />
        {suffix && (
          <span className="text-[1.1rem] text-[var(--text-muted)] ml-[3px]">
            {suffix}
          </span>
        )}
      </div>

      {/* Linha de brilho inferior (divisor delicado) */}
      <div className="h-px opacity-40" style={{
        background: 'linear-gradient(90deg, var(--accent), transparent)',
      }} />
    </motion.article>
  )
}
