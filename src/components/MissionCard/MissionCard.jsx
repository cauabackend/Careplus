// src/components/MissionCard/MissionCard.jsx
import { motion } from 'framer-motion'

export default function MissionCard({ titulo, Icone, meta, atual, unidade, pontos, concluida }) {
  const pct   = Math.min(Math.round((atual / meta) * 100), 100)
  const label = unidade === 'L'     ? `${atual}L / ${meta}L`
              : unidade === 'horas' ? `${atual}h / ${meta}h`
              : `${atual.toLocaleString('pt-BR')} / ${meta.toLocaleString('pt-BR')}`

  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="glass"
      style={{
        borderRadius: '18px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brilho de fundo quando concluída */}
      {concluida && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--accent-soft)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Cabeçalho */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            borderRadius: '10px',
            background: 'var(--accent-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icone size={16} strokeWidth={2} style={{ color: 'var(--accent)' }} />
          </div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
            {titulo}
          </span>
        </div>

        {concluida && (
          <div style={{
            fontSize: '0.6rem',
            fontWeight: '800',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent)',
            borderRadius: '999px',
            padding: '3px 10px',
            flexShrink: 0,
          }}>
            Feito
          </div>
        )}
      </header>

      {/* Progresso */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginBottom: '6px',
        }}>
          <span>{label}</span>
          <span style={{ color: pct >= 100 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700 }}>
            {pct}%
          </span>
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          />
        </div>
      </div>

      {/* Rodapé */}
      <footer style={{
        fontSize: '0.65rem',
        fontWeight: '600',
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>
        +{pontos} pts ao completar
      </footer>
    </motion.article>
  )
}
