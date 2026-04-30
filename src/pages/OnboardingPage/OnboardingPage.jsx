import { useState } from 'react'

export default function OnboardingPage({ onCadastro }) {
  const [etapa, setEtapa] = useState(1)
  const [nome, setNome] = useState('')
  const [notificacoes, setNotificacoes] = useState(false)
  const [erro, setErro] = useState('')

  function avancarEtapa1() {
    if (!nome.trim()) {
      setErro('Informe seu nome para continuar.')
      return
    }
    setErro('')
    setEtapa(2)
  }

  function recusarDados() {
    setErro('Para usar o CarePlus precisamos dos seus dados de saúde.')
  }

  function finalizarCadastro() {
    const novoUsuario = {
      nome: nome.trim(),
      pontos: 0,
      streak: 0,
      badges: ['primeiro_login'],
      missoes_concluidas: [],
      resgates: [],
      dados: { passos: 0, agua: 0, sono: 0 },
      ultimaData: new Date().toDateString(),
      consentimentos: { dados_saude: true, notificacoes },
    }
    onCadastro(novoUsuario)
  }

  return (
    <div className="cp-onboarding">
      <div className="cp-onboarding__card">
        <div className="cp-onboarding__logo">Care<span>Plus</span></div>
        <div className="cp-onboarding__subtitle">Sua jornada de saúde começa aqui.</div>

        {/* Etapa 1: Nome */}
        {etapa === 1 && (
          <div>
            <h5 style={{ color: 'var(--cp-navy)', fontWeight: 800, marginBottom: '1rem' }}>
              Como você quer ser chamado(a)?
            </h5>
            {erro && <div className="cp-alert cp-alert--error mb-3">{erro}</div>}
            <div className="mb-4">
              <label className="cp-form-label">Seu nome</label>
              <input
                className="cp-form-input"
                type="text"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && avancarEtapa1()}
                autoFocus
              />
            </div>
            <button className="btn-cp w-100" onClick={avancarEtapa1}>
              Continuar
            </button>
          </div>
        )}

        {/* Etapa 2: Dados de saúde (obrigatório) */}
        {etapa === 2 && (
          <div>
            <h5 style={{ color: 'var(--cp-navy)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Olá, {nome}. Um passo antes de começar.
            </h5>
            {erro && <div className="cp-alert cp-alert--error mb-3">{erro}</div>}
            <div className="cp-lgpd-box">
              <div className="cp-lgpd-box__title">Termo 1 — Dados de Saúde (Obrigatório)</div>
              <div className="cp-lgpd-box__text">
                O CarePlus usa seus dados de passos, hidratação e sono para gerar suas missões diárias.
                Você pode revogar este consentimento a qualquer momento em <strong>Privacidade</strong>.
              </div>
              <div className="d-flex gap-2">
                <button className="btn-cp btn-cp--teal flex-fill" onClick={() => { setErro(''); setEtapa(3) }}>
                  Aceitar
                </button>
                <button className="btn-cp btn-cp--outline flex-fill" onClick={recusarDados}>
                  Recusar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3: Notificações (opcional) */}
        {etapa === 3 && (
          <div>
            <h5 style={{ color: 'var(--cp-navy)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Quase lá, {nome}.
            </h5>
            <div className="cp-lgpd-box">
              <div className="cp-lgpd-box__title">Termo 2 — Notificações (Opcional)</div>
              <div className="cp-lgpd-box__text">
                Lembretes sobre missões, conquistas e novidades do catálogo.
                Este consentimento é independente do anterior.
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="notif"
                  checked={notificacoes}
                  onChange={e => setNotificacoes(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="notif" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                  Quero receber notificações
                </label>
              </div>
            </div>
            <button className="btn-cp w-100" onClick={finalizarCadastro}>
              Criar minha conta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
