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
      className="glass rounded-lg p-[18px] flex flex-col gap-[14px] relative overflow-hidden"
      style={{
        /* conclusão: borda-topo acende no acento, sem inundar o fundo */
        borderTop: concluida ? '2px solid var(--accent)' : undefined,
      }}
    >
      {/* Cabeçalho */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-[9px]">
          <Icone size={16} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">
            {titulo}
          </span>
        </div>

        {concluida && (
          <div className="text-[0.6rem] font-extrabold tracking-[0.12em] uppercase text-[var(--accent)] shrink-0">
            ✓ Feito
          </div>
        )}
      </header>

      {/* Progresso */}
      <div>
        <div className="flex justify-between text-[0.72rem] text-[var(--text-muted)] mb-[6px]">
          <span>{label}</span>
          <span className="font-bold" style={{ color: pct >= 100 ? 'var(--accent)' : 'var(--text-muted)' }}>
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
      <footer className="text-[0.65rem] font-semibold text-[var(--text-muted)] tracking-[0.04em]">
        +{pontos} pts ao completar
      </footer>
    </motion.article>
  )
}
