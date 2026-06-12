// src/pages/PrivacidadePage/PrivacidadePage.jsx
import { useState } from 'react'
import { ShieldCheck, Bell, Activity, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PageTransition from '../../components/PageTransition/PageTransition'

const ITENS = [
  {
    id: 'dados_saude',
    icone: Activity,
    titulo: 'Dados de Saúde',
    descricao: 'Passos, hidratação e sono — usados exclusivamente para calcular suas missões diárias.',
    obrigatorio: true,
  },
  {
    id: 'notificacoes',
    icone: Bell,
    titulo: 'Notificações',
    descricao: 'Lembretes sobre missões, conquistas e alertas do Sentinel.',
    obrigatorio: false,
  },
]

function Toggle({ ativo, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={ativo}
      onClick={onChange}
      disabled={disabled}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: ativo ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
        boxShadow: ativo ? '0 0 10px var(--accent-glow)' : 'none',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.25s, box-shadow 0.25s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: ativo ? 'calc(100% - 21px)' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
        display: 'block',
      }} />
    </button>
  )
}

export default function PrivacidadePage() {
  const { usuario } = useAuth()
  const [consentimentos, setConsentimentos] = useState({ dados_saude: true, notificacoes: true })

  function alternar(id) {
    setConsentimentos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: '700',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '4px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Lock size={12} />
          Configurações
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
        }}>
          Privacidade
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Gerencie seus consentimentos conforme a LGPD (Lei nº 13.709/2018).
        </p>
      </header>

      {/* Consentimentos */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {ITENS.map(({ id, icone: Icone, titulo, descricao, obrigatorio }) => {
          const ativo = consentimentos[id]
          return (
            <div
              key={id}
              className="glass"
              style={{
                borderRadius: '18px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderColor: ativo ? 'var(--accent)' : 'var(--card-border)',
                transition: 'border-color 0.25s',
              }}
            >
              {/* Ícone */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icone size={18} style={{ color: 'var(--accent)' }} />
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '3px',
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {titulo}
                  </span>
                  {obrigatorio && (
                    <span style={{
                      fontSize: '0.58rem', fontWeight: '800',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--accent)', padding: '2px 6px',
                      borderRadius: '4px', border: '1px solid var(--accent)',
                    }}>
                      Obrigatório
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                  {descricao}
                </p>
                <div style={{
                  fontSize: '0.65rem', fontWeight: '700',
                  color: ativo ? 'var(--accent)' : 'var(--text-faint)',
                  marginTop: '6px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>

              {/* Toggle */}
              <Toggle
                ativo={ativo}
                onChange={() => !obrigatorio && alternar(id)}
                disabled={obrigatorio}
              />
            </div>
          )
        })}
      </section>

      {/* Nota LGPD */}
      <div
        className="glass"
        style={{
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          borderColor: 'var(--accent)',
          background: 'var(--accent-soft)',
        }}
      >
        <ShieldCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
          Seus dados são protegidos pela{' '}
          <strong style={{ color: 'var(--text-primary)' }}>Lei Geral de Proteção de Dados</strong>
          {' '}(LGPD). Você pode revogar consentimentos opcionais a qualquer momento.
          {usuario && (
            <span style={{ display: 'block', marginTop: '6px', color: 'var(--text-faint)' }}>
              Conta: {usuario.email}
            </span>
          )}
        </p>
      </div>
    </PageTransition>
  )
}
