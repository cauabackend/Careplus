// src/pages/SentinelPage/SentinelPage.jsx
import { useState, useEffect } from 'react'
import { Shield, ShieldAlert } from 'lucide-react'
import { api } from '../../services/api'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import PageTransition from '../../components/PageTransition/PageTransition'

const TIPO_LABEL = {
  sleep_debt:    'Déficit de Sono',
  hydration_low: 'Hidratação Baixa',
  burnout_risk:  'Risco de Burnout',
  streak_break:  'Streak em Risco',
}

export default function SentinelPage() {
  const { estado }                = useVitalsWeatherCtx()
  const [alertas, setAlertas]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [pandaEvent, setPEvent]   = useState('app_open')

  const ativos = alertas.filter(a => !a.lido)
  const lidos  = alertas.filter(a =>  a.lido)

  useEffect(() => {
    api.getSentinel()
      .then(data => {
        setAlertas(data)
        if (data.some(a => !a.lido)) setPEvent('alert_triggered')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function marcarLido(id) {
    try {
      await api.marcarAlertaLido(id)
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a))
    } catch {}
  }

  return (
    <PageTransition>
      {/* Cabeçalho com panda */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', gap: '16px',
        marginBottom: '32px',
      }}>
        <div>
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: '4px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <ShieldAlert size={12} />
            Sentinel
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
          }}>
            Monitoramento
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Últimos 14 dias de padrões de saúde
          </p>
        </div>
        <PandaMascot healthState={ativos.length > 0 ? 'warning' : estado} size="sm" event={pandaEvent} />
      </div>

      {/* Carregando */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer-block glass" style={{ borderRadius: '14px', height: '80px' }} />
          ))}
        </div>
      )}

      {/* Vazio */}
      {!loading && ativos.length === 0 && (
        <div
          className="glass"
          style={{
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            borderColor: 'var(--accent)',
            background: 'var(--accent-soft)',
          }}
        >
          <Shield size={36} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Tudo sob controle
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Nenhum alerta ativo nos últimos 14 dias.
          </div>
        </div>
      )}

      {/* Alertas ativos */}
      {ativos.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: '12px',
          }}>
            {ativos.length} alerta{ativos.length > 1 ? 's' : ''} ativo{ativos.length > 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ativos.map(alerta => (
              <article
                key={alerta.id}
                className="glass"
                style={{
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: '12px',
                  borderColor: 'var(--accent)',
                  background: 'var(--accent-soft)',
                  transition: 'opacity 0.25s',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.82rem', fontWeight: '700',
                    color: 'var(--accent)', marginBottom: '4px',
                  }}>
                    {TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
                  </div>
                  <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {alerta.mensagem}
                  </div>
                </div>
                <button
                  onClick={() => marcarLido(alerta.id)}
                  style={{
                    fontSize: '0.68rem', fontWeight: '700',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '6px 12px', borderRadius: '999px',
                    border: '1px solid var(--accent)',
                    background: 'transparent',
                    color: 'var(--accent)',
                    cursor: 'pointer', flexShrink: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  Lido
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Alertas lidos */}
      {lidos.length > 0 && (
        <section>
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--text-faint)', marginBottom: '10px',
          }}>
            Anteriores
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lidos.map(alerta => (
              <div key={alerta.id} className="glass" style={{
                borderRadius: '14px', padding: '12px 16px', opacity: 0.4,
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {alerta.mensagem}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  )
}
