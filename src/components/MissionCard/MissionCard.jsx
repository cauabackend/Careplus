/*
 * MissionCard — widget de missão diária (estilo health premium)
 *
 * Props:
 *   titulo      → nome da missão (ex: "Caminhar")
 *   Icone       → componente lucide-react (ex: Activity) — uppercase = componente React
 *   meta        → valor-alvo (ex: 7500)
 *   atual       → valor atual do usuário
 *   unidade     → unidade de medida (ex: "passos")
 *   pontos      → pontos a ganhar ao completar
 *   concluida   → boolean — missão já cumprida hoje
 *   cor         → cor de identidade da missão
 *   sincronizado → boolean — exibe o selo "Sincronizado"
 */
export default function MissionCard({
  titulo, Icone, meta, atual, unidade,
  pontos, concluida, cor = '#00BFDF', sincronizado = false,
}) {
  const pct = Math.min((atual / meta) * 100, 100)

  return (
    <article
      className={`cp-mission ${concluida ? 'cp-mission--done' : ''}`}
      style={{ '--mission-color': cor }}
      aria-label={`Missão: ${titulo}`}
    >
      {/* Cabeçalho: ícone pastel + título + badge de pontos */}
      <header className="cp-mission__header">
        <div className="cp-mission__icon-wrap" aria-hidden="true">
          {Icone && <Icone size={20} strokeWidth={1.75} />}
        </div>
        <div className="cp-mission__meta-block">
          <h3 className="cp-mission__title">{titulo}</h3>
          {concluida
            ? <span className="cp-mission__badge cp-mission__badge--done">Concluída</span>
            : <span className="cp-mission__badge">+{pontos} pts</span>
          }
        </div>
      </header>

      {/* Barra de progresso semântica */}
      <div
        className="cp-mission__progress-track"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso: ${Math.round(pct)}%`}
      >
        <div
          className={`cp-mission__progress-bar${concluida ? ' done' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Valores numéricos */}
      <div className="cp-mission__stats">
        <span>{atual?.toLocaleString('pt-BR')} / {meta?.toLocaleString('pt-BR')} {unidade}</span>
        <span>{Math.round(pct)}%</span>
      </div>

      {/* Selo de sincronização */}
      {sincronizado && (
        <div className="cp-sync-pill" aria-live="polite">
          <span className="cp-sync-pill__dot" aria-hidden="true" />
          Sincronizado com Google Health
        </div>
      )}
    </article>
  )
}
