// src/pages/DashboardPage/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Award, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth }         from '../../context/AuthContext'
import { api }             from '../../services/api'
import StatCard            from '../../components/StatCard/StatCard'
import MissionCard         from '../../components/MissionCard/MissionCard'
import PandaMascot         from '../../components/PandaMascot/PandaMascot'
import Gauge               from '../../components/Gauge/Gauge'
import TrendChart          from '../../components/TrendChart/TrendChart'
import BarChart            from '../../components/BarChart/BarChart'
import PageTransition      from '../../components/PageTransition/PageTransition'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'
import { escolherFala } from '../../data/pandaFalas'
import { calcularScore } from '../../hooks/useVitalsWeather'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

const ESTADO_LABEL = {
  excellent: 'Excelente',
  good:      'Bom',
  warning:   'Normal',
  weak:      'Fraco',
  critical:  'Crítico',
}

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']  // getDay(): 0=domingo

// Cabeçalho de card de gráfico (eyebrow + métrica)
function VizHead({ esq, dir }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)]">{esq}</span>
      {dir != null && <span className="text-[0.72rem] font-bold text-[var(--accent)]">{dir}</span>}
    </div>
  )
}

export default function DashboardPage() {
  const { usuario, refreshUsuario } = useAuth()
  const { estado, score, loading: weatherLoading } = useVitalsWeatherCtx()
  const [progresso, setProgresso] = useState(null)
  const [missoes,   setMissoes]   = useState([])
  const [loadingData, setLoading] = useState(true)
  const [pandaEvent, setPandaEvent] = useState(null)
  const [fala,       setFala]       = useState('')
  const [historico,  setHistorico]  = useState([])

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    Promise.all([
      api.getProgresso().catch(() => null),
      api.getMissoes().catch(() => []),
      api.getHistorico().catch(() => []),
    ]).then(([prog, miss, hist]) => {
      setProgresso(prog)
      setMissoes(Array.isArray(miss) ? miss : (miss?.results ?? []))
      setHistorico(Array.isArray(hist) ? hist : (hist?.results ?? []))
      setLoading(false)
    })
    refreshUsuario()
    // Trigger panda look-up on app open
    setPandaEvent('app_open')
    const t = setTimeout(() => setPandaEvent(null), 800)
    return () => clearTimeout(t)
  }, [refreshUsuario])

  // Voz do panda (Sentinel + personalidade): fala ao abrir e renova a cada 32s
  // (tempo de ler), sempre contextual ao estado, horário e streak. Evita repetir
  // a fala anterior para não parecer "travado".
  useEffect(() => {
    const ctx = () => ({ estado, hora: new Date().getHours(), streak: usuario?.streak ?? 0 })
    setFala(escolherFala(ctx()))
    const id = setInterval(() => {
      setFala(prev => {
        let nova = escolherFala(ctx())
        for (let i = 0; i < 4 && nova === prev; i++) nova = escolherFala(ctx())
        return nova
      })
    }, 32000)
    return () => clearInterval(id)
  }, [estado, usuario?.streak])

  if (!usuario) return null

  const dados = {
    passos: progresso?.passos ?? 0,
    agua:   progresso?.agua   ?? 0,
    sono:   progresso?.sono   ?? 0,
  }
  const missoesConcluidas = Array.isArray(missoes) ? missoes.map(m => m.chave_missao) : []

  const speechText = fala

  // Séries dos últimos 7 dias (defensivo: forma/ordem do backend é desconhecida)
  const num = x => (Number.isFinite(+x) ? +x : 0)
  const dataDe = d => new Date(d.data || d.dia || d.date)
  const ordenado = [...historico].sort((a, b) => {
    const da = dataDe(a), db = dataDe(b)
    return (isNaN(da) || isNaN(db)) ? 0 : da - db
  })
  const ultimos7   = ordenado.slice(-7)
  const serieScore = ultimos7.map(d => calcularScore({ passos: num(d.passos), agua: num(d.agua), sono: num(d.sono) }))
  const seriePassos = ultimos7.map(d => num(d.passos))
  const rotulos    = ultimos7.map(d => {
    const dt = dataDe(d)
    return isNaN(dt) ? '' : DOW[dt.getDay()]
  })
  const temSerie   = ultimos7.length >= 2
  const deltaScore = temSerie ? serieScore[serieScore.length - 1] - serieScore[0] : 0

  return (
    <PageTransition>
      {/* Saudação */}
      <header className="mb-8">
        <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--accent)] mb-1">
          Vitals Weather — {ESTADO_LABEL[estado]}
        </div>
        <h1 className="text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.1]">
          Olá, {usuario.first_name || usuario.username}
        </h1>
        <p className="text-[0.82rem] text-[var(--text-muted)] mt-1 capitalize">
          {hoje}
        </p>
      </header>

      {/* Panda + balão de fala (voz do panda) */}
      <div className="flex justify-center mb-9">
        <PandaMascot
          healthState={estado}
          pose="dashboard"
          size="lg"
          speechText={speechText}
          event={pandaEvent}
        />
      </div>

      {/* Score — medidor (gauge) */}
      <div className="flex justify-center mb-8">
        <Gauge
          value={score}
          label="Score de saúde"
          estadoLabel={ESTADO_LABEL[estado]}
          size={210}
        />
      </div>

      {/* Stats grid */}
      <section aria-label="Estatísticas" className="grid gap-3 mb-7" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      }}>
        {loadingData ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer-block glass rounded-lg h-20 overflow-hidden" />
          ))
        ) : (
          <>
            <StatCard label="Pontos"  valor={usuario.pontos}              Icone={Star}         />
            <StatCard label="Streak"  valor={usuario.streak}  suffix="d"  Icone={Zap}          />
            <StatCard label="Badges"  valor={usuario.badges_count ?? 0}   Icone={Award}        />
            <StatCard label="Missões" valor={missoesConcluidas.length}     Icone={CheckCircle2} />
          </>
        )}
      </section>

      {/* Gráficos da semana (só quando há histórico) */}
      {temSerie && (
        <section aria-label="Tendências da semana" className="grid gap-3 mb-7" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}>
          <article className="glass rounded-lg p-[18px]">
            <VizHead esq="Score · 7 dias" dir={`${deltaScore >= 0 ? '+' : ''}${deltaScore}`} />
            <div className="font-[family-name:var(--font-display)] text-[2rem] leading-none text-[var(--text-primary)] mb-1.5">
              {serieScore[serieScore.length - 1]}
            </div>
            <TrendChart data={serieScore} labels={rotulos} />
          </article>

          <article className="glass rounded-lg p-[18px]">
            <VizHead esq="Passos · 7 dias" />
            <div className="font-[family-name:var(--font-display)] text-[2rem] leading-none text-[var(--text-primary)] mb-2.5">
              {(seriePassos[seriePassos.length - 1] ?? 0).toLocaleString('pt-BR')}
            </div>
            <BarChart data={seriePassos} labels={rotulos} />
          </article>
        </section>
      )}

      {/* Missões do dia */}
      <section aria-labelledby="missoes-title" className="mb-7">
        <div className="flex justify-between items-center mb-3.5">
          <div>
            <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--text-muted)] mb-0.5">
              Hoje
            </div>
            <h2 id="missoes-title" className="text-base font-extrabold text-[var(--text-primary)] tracking-[-0.01em]">
              Missões do Dia
            </h2>
          </div>
          <Link
            to="/missoes"
            className="flex items-center gap-1 text-[0.72rem] font-bold text-[var(--accent)] no-underline tracking-[0.04em]"
          >
            Atualizar
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-3" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        }}>
          {loadingData ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer-block glass rounded-lg overflow-hidden h-[130px]" />
            ))
          ) : (
            MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade }) => (
              <MissionCard
                key={chave}
                titulo={titulo}
                Icone={Icone}
                meta={METAS[chave]}
                atual={dados[chave] ?? 0}
                unidade={unidade}
                pontos={PONTOS_POR_MISSAO[chave]}
                concluida={missoesConcluidas.includes(chave)}
              />
            ))
          )}
        </div>
      </section>
    </PageTransition>
  )
}
