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
    descricao: 'Lembretes sobre missões, conquistas e os recados do panda.',
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
      className="w-[44px] h-6 rounded-full border-none relative shrink-0"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: ativo ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
        boxShadow: ativo ? '0 0 10px var(--accent-glow)' : 'none',
        transition: 'background 0.25s, box-shadow 0.25s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span className="absolute top-[3px] w-[18px] h-[18px] rounded-[50%] bg-[#fff] block" style={{
        left: ativo ? 'calc(100% - 21px)' : '3px',
        transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
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
      <header className="mb-8">
        <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--accent)] mb-1 flex items-center gap-[6px]">
          <Lock size={12} />
          Configurações
        </div>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.025em]">
          Privacidade
        </h1>
        <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
          Gerencie seus consentimentos conforme a LGPD (Lei nº 13.709/2018).
        </p>
      </header>

      {/* Consentimentos */}
      <section className="flex flex-col gap-[10px] mb-5">
        {ITENS.map(({ id, icone: Icone, titulo, descricao, obrigatorio }) => {
          const ativo = consentimentos[id]
          return (
            <div
              key={id}
              className="glass rounded-[18px] py-[18px] px-5 flex items-center gap-4"
              style={{
                borderColor: ativo ? 'var(--accent)' : 'var(--card-border)',
                transition: 'border-color 0.25s',
              }}
            >
              {/* Ícone */}
              <div className="w-10 h-10 rounded-[12px] bg-[var(--accent-soft)] border border-[var(--accent)] flex items-center justify-center shrink-0">
                <Icone size={18} style={{ color: 'var(--accent)' }} />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-[3px]">
                  <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">
                    {titulo}
                  </span>
                  {obrigatorio && (
                    <span className="text-[0.58rem] font-extrabold tracking-[0.12em] uppercase text-[var(--accent)] py-[2px] px-[6px] rounded-[4px] border border-[var(--accent)]">
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="text-[0.75rem] text-[var(--text-muted)] leading-[1.45] m-0">
                  {descricao}
                </p>
                <div
                  className="text-[0.65rem] font-bold mt-[6px] tracking-[0.06em] uppercase"
                  style={{ color: ativo ? 'var(--accent)' : 'var(--text-faint)' }}
                >
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
        className="glass rounded-[16px] py-4 px-[18px] flex items-start gap-3 !border-[var(--accent)] bg-[var(--accent-soft)]"
      >
        <ShieldCheck size={18} className="shrink-0 mt-[2px]" style={{ color: 'var(--accent)' }} />
        <p className="text-[0.77rem] text-[var(--text-muted)] leading-[1.55] m-0">
          Seus dados são protegidos pela{' '}
          <strong className="text-[var(--text-primary)]">Lei Geral de Proteção de Dados</strong>
          {' '}(LGPD). Você pode revogar consentimentos opcionais a qualquer momento.
          {usuario && (
            <span className="block mt-[6px] text-[var(--text-faint)]">
              Conta: {usuario.email}
            </span>
          )}
        </p>
      </div>
    </PageTransition>
  )
}
