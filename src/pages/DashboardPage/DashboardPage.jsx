// src/pages/DashboardPage/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Award, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth }         from '../../context/AuthContext'
import { api }             from '../../services/api'
import StatCard            from '../../components/StatCard/StatCard'
import MissionCard         from '../../components/MissionCard/MissionCard'
import PandaMascot         from '../../components/PandaMascot/PandaMascot'
import PageTransition      from '../../components/PageTransition/PageTransition'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

const ESTADO_LABEL = {
  excellent: 'Excelente',
  good:      'Bom',
  warning:   'Normal',
  weak:      'Fraco',
  critical:  'Crítico',
}

const SENTINEL_SPEECH = {
  excellent: 'Tudo perfeito! Continue assim e vire lenda.',
  good:      'Indo bem. Feche as missões de hoje.',
  warning:   'Relaxa, mas não esqueça das metas.',
  weak:      'Seus padrões estão irregulares. Cuida-se!',
  critical:  'Alerta! Seus dados precisam de atenção urgente.',
}

function shimmerStyle() {
  return {
    borderRadius: '18px',
    height: '80px',
    overflow: 'hidden',
  }
}

export default function DashboardPage() {
  const { usuario, refreshUsuario } = useAuth()
  const { estado, score, loading: weatherLoading } = useVitalsWeatherCtx()
  const [progresso, setProgresso] = useState(null)
  const [missoes,   setMissoes]   = useState([])
  const [alertas,   setAlertas]   = useState([])
  const [loadingData, setLoading] = useState(true)
  const [pandaEvent, setPandaEvent] = useState(null)

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    Promise.all([
      api.getProgresso().catch(() => null),
      api.getMissoes().catch(() => []),
      api.getSentinel().catch(() => []),
    ]).then(([prog, miss, al]) => {
      setProgresso(prog)
      setMissoes(Array.isArray(miss) ? miss : (miss?.results ?? []))
      setAlertas(Array.isArray(al) ? al : (al?.results ?? []))
      setLoading(false)
    })
    refreshUsuario()
    // Trigger panda look-up on app open
    setPandaEvent('app_open')
    const t = setTimeout(() => setPandaEvent(null), 800)
    return () => clearTimeout(t)
  }, [refreshUsuario])

  if (!usuario) return null

  const dados = {
    passos: progresso?.passos ?? 0,
    agua:   progresso?.agua   ?? 0,
    sono:   progresso?.sono   ?? 0,
  }
  const missoesConcluidas = Array.isArray(missoes) ? missoes.map(m => m.chave_missao) : []
  const alertaNaoLido     = alertas.find(a => !a.lido)

  // Speech do panda: prioriza alerta real
  const speechText = alertaNaoLido
    ? alertaNaoLido.mensagem
    : SENTINEL_SPEECH[estado]

  return (
    <PageTransition>
      {/* Saudação */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: '700',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '4px',
        }}>
          Vitals Weather — {ESTADO_LABEL[estado]}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Olá, {usuario.first_name || usuario.username}
        </h1>
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          marginTop: '4px',
          textTransform: 'capitalize',
        }}>
          {hoje}
        </p>
      </header>

      {/* Panda + balão SENTINEL */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
        <PandaMascot
          healthState={estado}
          pose="dashboard"
          size="lg"
          speechText={speechText}
          event={pandaEvent}
        />
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.7rem', fontWeight: '600',
          color: 'var(--text-muted)', marginBottom: '6px',
          letterSpacing: '0.08em',
        }}>
          <span>Score de saúde</span>
          <span style={{ color: 'var(--accent)' }}>{score}/100</span>
        </div>
        <div className="progress-bar" style={{ height: '8px' }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <section aria-label="Estatísticas" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {loadingData ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer-block glass" style={shimmerStyle()} />
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

      {/* Missões do dia */}
      <section aria-labelledby="missoes-title" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '14px',
        }}>
          <div>
            <div style={{
              fontSize: '0.6rem', fontWeight: '700',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '2px',
            }}>
              Hoje
            </div>
            <h2 id="missoes-title" style={{
              fontSize: '1rem', fontWeight: '800',
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
            }}>
              Missões do Dia
            </h2>
          </div>
          <Link
            to="/missoes"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.72rem', fontWeight: '700',
              color: 'var(--accent)', textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            Atualizar
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
        }}>
          {loadingData ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer-block glass" style={{ ...shimmerStyle(), height: '130px' }} />
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

      {/* Banner SENTINEL */}
      <motion.aside
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="glass"
        style={{
          borderRadius: '20px',
          padding: '20px 22px',
          borderColor: 'var(--accent)',
          background: 'var(--accent-soft)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{
              fontSize: '0.6rem', fontWeight: '800',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '4px',
            }}>
              Sentinel
            </div>
            <div style={{
              fontSize: '0.92rem', fontWeight: '700',
              color: 'var(--text-primary)',
            }}>
              {alertas.length > 0
                ? `${alertas.filter(a => !a.lido).length} alerta(s) não lido(s)`
                : 'Tudo sob controle'}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}>
              Detecção precoce de padrões irregulares
            </div>
          </div>
          <Link
            to="/sentinel"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.72rem', fontWeight: '800',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '10px 18px',
              borderRadius: '999px',
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 0 16px var(--accent-glow)',
            }}
          >
            Ver alertas
            <ArrowRight size={13} />
          </Link>
        </div>
      </motion.aside>
    </PageTransition>
  )
}
