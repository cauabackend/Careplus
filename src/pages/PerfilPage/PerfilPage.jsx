import { Star, Zap, CheckCircle2, Gift, Award, CheckCircle } from 'lucide-react'
import BadgeCard from '../../components/BadgeCard/BadgeCard'
import StatCard from '../../components/StatCard/StatCard'
import { BADGES_DISPONIVEIS } from '../../data/constants'

export default function PerfilPage({ usuario }) {
  const { nome, pontos, streak, badges, resgates, missoes_concluidas } = usuario

  const badgesConquistadas = BADGES_DISPONIVEIS.filter(b => badges.includes(b.id))

  return (
    <div>
      <header className="mb-4">
        <div className="cp-page-label">Conta</div>
        <h1 className="cp-page-title">Meu Perfil</h1>
      </header>

      {/* Card do usuário */}
      <div
        className="cp-card mb-4"
        role="banner"
        style={{ background: 'linear-gradient(135deg, var(--cp-navy) 0%, #071840 100%)', border: 'none' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 60, height: 60, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--cp-teal), #006F87)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: '#fff',
            fontFamily: "'Sora', sans-serif",
          }}>
            {nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
              {nome}
            </div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.85rem' }}>Membro CarePlus</div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <section aria-label="Estatísticas do perfil">
        <div className="cp-grid cp-grid--stats mb-4">
          <StatCard label="Pontos Totais" valor={pontos}                    Icone={Star}         invertido />
          <StatCard label="Streak"        valor={`${streak}d`}              Icone={Zap}          cor="var(--cp-orange)" />
          <StatCard label="Missões"       valor={missoes_concluidas.length} Icone={CheckCircle2} cor="var(--cp-success)" />
          <StatCard label="Resgates"      valor={resgates.length}           Icone={Gift}         cor="var(--cp-gold)" />
        </div>
      </section>

      {/* Badges */}
      <section aria-labelledby="badges-title" className="cp-card mb-4">
        <div className="cp-page-label mb-1">Conquistas</div>
        <h2 id="badges-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cp-text)', marginBottom: '1.25rem', transition: 'color .35s' }}>
          Badges ({badgesConquistadas.length}/{BADGES_DISPONIVEIS.length})
        </h2>
        {badgesConquistadas.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty__icon">
              <Award size={40} strokeWidth={1.5} style={{ color: 'var(--cp-border)' }} />
            </div>
            <p>Complete missões para conquistar suas primeiras badges.</p>
          </div>
        ) : (
          <div className="cp-grid cp-grid--badges">
            {badgesConquistadas.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </section>

      {/* Histórico de resgates */}
      {resgates.length > 0 && (
        <section aria-labelledby="resgates-title" className="cp-card">
          <div className="cp-page-label mb-1">Histórico</div>
          <h2 id="resgates-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cp-text)', marginBottom: '1rem', transition: 'color .35s' }}>
            Itens Resgatados
          </h2>
          <ul className="list-unstyled mb-0">
            {resgates.map((r, i) => (
              <li
                key={i}
                className="d-flex align-items-center gap-2 py-2"
                style={{ borderBottom: i < resgates.length - 1 ? '1px solid var(--cp-border)' : 'none', fontSize: '0.9rem' }}
              >
                <CheckCircle size={16} strokeWidth={2} style={{ color: 'var(--cp-success)', flexShrink: 0 }} />
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
