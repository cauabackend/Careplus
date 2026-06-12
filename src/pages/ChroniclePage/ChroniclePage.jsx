// src/pages/ChroniclePage/ChroniclePage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'
import PageTransition from '../../components/PageTransition/PageTransition'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function MonthCard({ entry, index }) {
  const { mes, dias_ativos, total_dias, densidade } = entry
  const nomeMes = MESES[mes - 1] || `Mês ${mes}`
  const pct     = Math.round(densidade * 100)

  return (
    <motion.article
      initial={{ opacity: 1, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass"
      style={{ borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* Cabeçalho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {nomeMes}
        </h3>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--text-muted)' }}>
          {dias_ativos}/{total_dias} dias
        </span>
      </header>

      {/* Grid de dias */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
        aria-label={`Dias ativos em ${nomeMes}`}
      >
        {Array.from({ length: total_dias }, (_, i) => (
          <div
            key={i}
            style={{
              height: '8px',
              borderRadius: '3px',
              background: i < dias_ativos ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
              boxShadow: i < dias_ativos ? '0 0 4px var(--accent-glow)' : 'none',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Barra de densidade */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.65rem', color: 'var(--text-muted)',
          marginBottom: '5px', fontWeight: '600',
          letterSpacing: '0.06em',
        }}>
          <span>Densidade</span>
          <span style={{ color: 'var(--accent)' }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: '5px' }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.06 + 0.2 }}
          />
        </div>
      </div>
    </motion.article>
  )
}

export default function ChroniclePage() {
  const { estado } = useVitalsWeatherCtx()
  const [dados,     setDados]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [erro,      setErro]      = useState(null)

  useEffect(() => {
    api.getChronicle()
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', gap: '16px',
        marginBottom: '32px',
      }}>
        <header>
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: '4px',
          }}>
            Histórico
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
          }}>
            The Chronicle
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Seu histórico de saúde mês a mês — cada quadrado é um dia.
          </p>
        </header>
        <PandaMascot healthState={estado} pose="chronicle" size="sm" />
      </div>

      {/* Estados */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer-block glass" style={{ borderRadius: '18px', height: '160px' }} />
          ))}
        </div>
      )}

      {!loading && erro && (
        <div className="glass" style={{
          borderRadius: '16px', padding: '20px',
          borderColor: '#FF3A3A', background: 'rgba(255,58,58,0.08)',
          color: '#FF3A3A', fontSize: '0.82rem', fontWeight: '600',
        }}>
          {erro}
        </div>
      )}

      {!loading && !erro && dados.length === 0 && (
        <div className="glass" style={{
          borderRadius: '20px', padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Nenhuma entrada ainda
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Complete suas primeiras missões para ver o histórico.
          </div>
        </div>
      )}

      {!loading && dados.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {dados.map((entry, i) => (
            <MonthCard key={`${entry.ano}-${entry.mes}`} entry={entry} index={i} />
          ))}
        </div>
      )}
    </PageTransition>
  )
}
