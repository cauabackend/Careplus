import { Link } from 'react-router-dom'
import { Star, Zap, Award, CheckCircle2 } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard'
import MissionCard from '../../components/MissionCard/MissionCard'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'

export default function DashboardPage({ usuario }) {
  const { nome, pontos, streak, badges, missoes_concluidas, dados } = usuario

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div>
      <header className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <div className="cp-page-label">Início</div>
          <h1 className="cp-page-title">Olá, {nome}</h1>
          <p style={{ color: 'var(--cp-muted)', fontSize: '0.875rem', marginTop: '4px', textTransform: 'capitalize', transition: 'color .35s' }}>
            {hoje}
          </p>
        </div>
      </header>

      {/* Estatísticas */}
      <section aria-label="Estatísticas do usuário">
        <div className="cp-grid cp-grid--stats mb-4">
          <StatCard label="Pontos"         valor={pontos}                                    Icone={Star}         invertido />
          <StatCard label="Streak"         valor={`${streak} dia${streak !== 1 ? 's' : ''}`} Icone={Zap}          cor="var(--cp-orange)" />
          <StatCard label="Badges"         valor={badges.length}                              Icone={Award}        cor="var(--cp-gold)" />
          <StatCard label="Missões Feitas" valor={missoes_concluidas.length}                  Icone={CheckCircle2} cor="var(--cp-success)" />
        </div>
      </section>

      {/* Missões do dia */}
      <section aria-labelledby="dash-missoes-title" className="cp-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <div className="cp-page-label">Hoje</div>
            <h2 id="dash-missoes-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cp-text)', margin: 0, transition: 'color .35s' }}>
              Missões do Dia
            </h2>
          </div>
          <Link to="/missoes" className="btn-cp btn-cp--teal btn-cp--sm">
            Atualizar progresso
          </Link>
        </div>

        <div className="cp-grid cp-grid--missions">
          {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade, cor }) => (
            <MissionCard
              key={chave}
              titulo={titulo}
              Icone={Icone}
              meta={METAS[chave]}
              atual={dados[chave]}
              unidade={unidade}
              pontos={PONTOS_POR_MISSAO[chave]}
              concluida={missoes_concluidas.includes(chave)}
              cor={cor}
            />
          ))}
        </div>
      </section>

      {/* Banner catálogo */}
      <aside className="cp-card" style={{ background: 'linear-gradient(135deg, var(--cp-navy) 0%, #071840 100%)', border: 'none' }}>
        <div className="row align-items-center gy-3">
          <div className="col">
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Catálogo
            </div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: '4px 0', fontFamily: "'Sora', sans-serif" }}>
              Troque seus pontos por recompensas
            </h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.875rem', margin: 0 }}>
              Saldo disponível: <strong style={{ color: '#fff' }}>{pontos} pts</strong>
            </p>
          </div>
          <div className="col-auto">
            <Link to="/catalogo" className="btn-cp btn-cp--teal">Ver Catálogo</Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
