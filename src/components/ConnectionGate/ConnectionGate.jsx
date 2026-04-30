import { useState } from 'react'
import { HeartPulse, ShieldCheck } from 'lucide-react'
import { useConnection } from '../../context/ConnectionContext'

export default function ConnectionGate() {
  const { conectar } = useConnection()
  const [aceito, setAceito]         = useState(false)
  const [conectando, setConectando] = useState(false)

  async function handleConectar() {
    if (!aceito) return
    setConectando(true)
    await new Promise(r => setTimeout(r, 1800))
    conectar()
  }

  return (
    <div className="cp-gate">
      <div className="cp-gate__card">
        {/* Header */}
        <div className="cp-gate__header">
          <div className="cp-gate__icon-wrap">
            <HeartPulse size={28} strokeWidth={1.5} />
          </div>
          <div>
            <div className="cp-page-label">Autorização necessária</div>
            <h1 className="cp-gate__title">Conectar Google Health</h1>
          </div>
        </div>

        {/* LGPD box */}
        <div className="cp-lgpd-box">
          <div className="cp-lgpd-box__title">
            <ShieldCheck size={13} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
            Termos de Privacidade — LGPD
          </div>
          <p className="cp-lgpd-box__text">
            O CarePlus acessa apenas dados de saúde que você autorizar: passos, hidratação e sono.
            Nenhuma informação é compartilhada com terceiros. Você pode revogar o acesso a qualquer
            momento nas configurações de privacidade. Os dados são utilizados exclusivamente para
            calcular seu progresso nas missões e pontuar recompensas.
          </p>
          <label className="cp-gate__checkbox-label">
            <input
              type="checkbox"
              checked={aceito}
              onChange={e => setAceito(e.target.checked)}
              disabled={conectando}
            />
            <span>Li e aceito os Termos de Privacidade e a Política de Dados do CarePlus.</span>
          </label>
        </div>

        <button
          className="btn-cp btn-cp--teal"
          style={{ width: '100%', justifyContent: 'center', gap: 10 }}
          onClick={handleConectar}
          disabled={!aceito || conectando}
        >
          {conectando ? (
            <>
              <span className="cp-gate__spinner" />
              Conectando…
            </>
          ) : (
            <>
              <HeartPulse size={17} strokeWidth={2} />
              Conectar com Google Health
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--cp-muted)', marginTop: '1rem', marginBottom: 0 }}>
          Esta é uma demonstração — nenhum dado real é acessado.
        </p>
      </div>
    </div>
  )
}
