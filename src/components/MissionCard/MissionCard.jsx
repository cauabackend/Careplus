export default function MissionCard({ titulo, Icone, meta, atual, unidade, pontos, concluida, cor }) {
  const pct     = Math.min(Math.round((atual / meta) * 100), 100)
  const label   = unidade === 'L'      ? `${atual}L / ${meta}L`
                : unidade === 'horas'  ? `${atual}h / ${meta}h`
                : `${atual.toLocaleString('pt-BR')} / ${meta.toLocaleString('pt-BR')}`

  return (
    <article className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-4 flex flex-col gap-3 transition-colors">
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${cor}18` }}>
            <Icone size={15} strokeWidth={2} style={{ color: cor }} />
          </div>
          <span className="text-sm font-semibold text-text dark:text-d-text">{titulo}</span>
        </div>
        {concluida && (
          <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-cp-success/10 text-cp-success px-2 py-0.5 rounded-full">
            ✓ Feito
          </span>
        )}
      </header>

      {/* Barra de progresso */}
      <div>
        <div className="flex justify-between text-xs text-muted dark:text-d-muted mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-border dark:bg-d-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: cor }}
          />
        </div>
      </div>

      <footer className="text-[0.65rem] font-semibold text-muted dark:text-d-muted">
        +{pontos} pts ao completar
      </footer>
    </article>
  )
}
