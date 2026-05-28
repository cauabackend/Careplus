import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Award, CheckCircle2 } from 'lucide-react'
import { useAuth }     from '../../context/AuthContext'
import { api }         from '../../services/api'
import StatCard        from '../../components/StatCard/StatCard'
import MissionCard     from '../../components/MissionCard/MissionCard'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'

export default function DashboardPage() {
  const { usuario, refreshUsuario } = useAuth()
  const [progresso, setProgresso]   = useState(null)
  const [missoes,   setMissoes]     = useState([])

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    api.getProgresso().then(setProgresso).catch(() => {})
    api.getMissoes().then(setMissoes).catch(() => {})
    refreshUsuario()
  }, [refreshUsuario])

  if (!usuario) return null

  const dados           = progresso ?? { passos: 0, agua: 0, sono: 0 }
  const missoesConcluidas = missoes.map(m => m.chave_missao)

  return (
    <div>
      <header className="flex justify-between items-start mb-6 flex-wrap gap-2">
        <div>
          <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Início</div>
          <h1 className="font-sora text-2xl font-extrabold text-text dark:text-d-text mt-0.5">
            Olá, {usuario.first_name || usuario.username}
          </h1>
          <p className="text-sm text-muted dark:text-d-muted mt-0.5 capitalize">{hoje}</p>
        </div>
      </header>

      {/* Estatísticas */}
      <section aria-label="Estatísticas do usuário" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Pontos"         valor={usuario.pontos}                                         Icone={Star}         invertido />
        <StatCard label="Streak"         valor={`${usuario.streak}d`}                                   Icone={Zap}          cor="#F97316" />
        <StatCard label="Badges"         valor={usuario.badges_count ?? '—'}                            Icone={Award}        cor="#F59E0B" />
        <StatCard label="Missões"        valor={missoesConcluidas.length}                               Icone={CheckCircle2} cor="#10B981" />
      </section>

      {/* Missões do dia */}
      <section aria-labelledby="dash-missoes-title" className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Hoje</div>
            <h2 id="dash-missoes-title" className="font-sora text-base font-bold text-text dark:text-d-text mt-0.5">
              Missões do Dia
            </h2>
          </div>
          <Link
            to="/missoes"
            className="bg-cp-teal hover:bg-[#00a8c4] text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors"
          >
            Atualizar progresso
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade, cor }) => (
            <MissionCard
              key={chave}
              titulo={titulo}
              Icone={Icone}
              meta={METAS[chave]}
              atual={dados[chave] ?? 0}
              unidade={unidade}
              pontos={PONTOS_POR_MISSAO[chave]}
              concluida={missoesConcluidas.includes(chave)}
              cor={cor}
            />
          ))}
        </div>
      </section>

      {/* Banner SENTINEL */}
      <aside className="bg-cp-navy rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-white/40">SENTINEL</div>
            <h2 className="font-sora text-base font-bold text-white mt-0.5">
              Monitore seus padrões de saúde
            </h2>
            <p className="text-sm text-white/50 mt-0.5">Alertas inteligentes antes do problema aparecer</p>
          </div>
          <Link
            to="/sentinel"
            className="bg-cp-teal hover:bg-[#00a8c4] text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors"
          >
            Ver alertas
          </Link>
        </div>
      </aside>
    </div>
  )
}
