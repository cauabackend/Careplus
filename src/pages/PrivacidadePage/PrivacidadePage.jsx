/**
 * PrivacidadePage — gerenciamento dos consentimentos LGPD
 *
 * Props:
 *   usuario    → objeto do usuário
 *   setUsuario → salva as alterações no localStorage
 */
export default function PrivacidadePage({ usuario, setUsuario }) {
  const { consentimentos } = usuario

  // Alterna (liga/desliga) um consentimento pelo nome do campo
  function alternar(campo) {
    // Computed property name: usa a variável como chave do objeto
    const novosConsentimentos = {
      ...consentimentos,
      [campo]: !consentimentos[campo],
    }
    setUsuario({ ...usuario, consentimentos: novosConsentimentos })
  }

  const itens = [
    {
      campo: 'dados_saude',
      titulo: '📋 Dados de Saúde',
      descricao: 'Usamos seus dados de passos, hidratação e sono para calcular suas missões diárias.',
      obrigatorio: true,
    },
    {
      campo: 'notificacoes',
      titulo: '🔔 Notificações',
      descricao: 'Lembretes sobre missões, conquistas e novidades do catálogo de recompensas.',
      obrigatorio: false,
    },
  ]

  return (
    <div>
      <header className="mb-4">
        <div className="cp-page-label">Configurações</div>
        <h1 className="cp-page-title">Privacidade & LGPD</h1>
        <p style={{ color: 'var(--cp-muted)', fontSize: '0.875rem', marginTop: '6px' }}>
          Gerencie seus consentimentos. Você pode alterar a qualquer momento,
          conforme a Lei 13.709/2018 (LGPD).
        </p>
      </header>

      <section aria-label="Consentimentos LGPD" style={{ maxWidth: 600 }}>
        {itens.map(({ campo, titulo, descricao, obrigatorio }) => {
          const ativo = consentimentos[campo]
          return (
            <article key={campo} className="cp-lgpd-box" aria-label={titulo}>
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div style={{ flex: 1 }}>
                  <div className="cp-lgpd-box__title">
                    {titulo}
                    {obrigatorio && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--cp-orange)', marginLeft: 6, fontWeight: 700 }}>
                        OBRIGATÓRIO
                      </span>
                    )}
                  </div>
                  <div className="cp-lgpd-box__text" style={{ marginBottom: 0 }}>
                    {descricao}
                  </div>
                </div>

                {/* Toggle Bootstrap — useEffect não é necessário aqui */}
                <div className="form-check form-switch mb-0" style={{ paddingLeft: '3rem' }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={campo}
                    checked={ativo}
                    onChange={() => alternar(campo)}
                    style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                  />
                </div>
              </div>

              <div style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                marginTop: 8,
                color: ativo ? 'var(--cp-success)' : 'var(--cp-muted)',
              }}>
                {ativo ? '✓ Consentimento ativo' : '✗ Consentimento inativo'}
              </div>
            </article>
          )
        })}

        <div className="cp-alert cp-alert--info" role="note">
          ⚖️ Seus dados são protegidos pela <strong>Lei Geral de Proteção de Dados</strong> (LGPD — Lei nº 13.709/2018).
        </div>
      </section>
    </div>
  )
}
