/*
 * StatCard — card de estatística com ícone lucide no topo direito
 *
 * Props:
 *   label     → rótulo (ex: "Pontos Totais")
 *   valor     → valor exibido (ex: 420 ou "7d")
 *   Icone     → componente lucide-react (ex: Star) — uppercase = React component
 *   cor       → cor da borda superior e do ícone (CSS value ou variável)
 *   invertido → boolean — fundo escuro navy (card de pontos)
 */
export default function StatCard({ label, valor, Icone, cor, invertido }) {
  return (
    <div
      className={`cp-stat-card ${invertido ? 'cp-stat-card--inv' : ''}`}
      style={invertido ? {} : { '--color': cor }}
    >
      {/* Ícone no topo direito — presença discreta, não compete com o número */}
      {Icone && (
        <div className="cp-stat-card__icon-row">
          <Icone size={18} strokeWidth={1.75} />
        </div>
      )}
      <div className="cp-stat-card__value">{valor}</div>
      <div className="cp-stat-card__label">{label}</div>
    </div>
  )
}
