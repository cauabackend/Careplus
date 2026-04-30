import { useState } from 'react'
import { Star } from 'lucide-react'
import { CATALOGO } from '../../data/constants'
import StatCard from '../../components/StatCard/StatCard'

export default function CatalogoPage({ usuario, setUsuario }) {
  const [mensagem, setMensagem] = useState(null)

  function resgatar(item) {
    const { nome, preco } = item

    if (usuario.pontos < preco) {
      setMensagem({ tipo: 'error', texto: `Faltam ${preco - usuario.pontos} pts para resgatar "${nome}".` })
      return
    }

    setUsuario({
      ...usuario,
      pontos:   usuario.pontos - preco,
      resgates: [...usuario.resgates, nome],
      badges:   usuario.badges.includes('resgate_feito')
        ? usuario.badges
        : [...usuario.badges, 'resgate_feito'],
    })
    setMensagem({ tipo: 'success', texto: `"${nome}" resgatado com sucesso.` })
  }

  return (
    <div>
      <header className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <div className="cp-page-label">Loja</div>
          <h1 className="cp-page-title">Catálogo de Recompensas</h1>
          <p style={{ color: 'var(--cp-muted)', fontSize: '0.875rem', marginTop: '4px', transition: 'color .35s' }}>
            Troque seus pontos por benefícios exclusivos.
          </p>
        </div>
        <StatCard label="Seu saldo" valor={`${usuario.pontos} pts`} Icone={Star} cor="var(--cp-teal)" />
      </header>

      {mensagem && (
        <div className={`cp-alert cp-alert--${mensagem.tipo} mb-4`}>{mensagem.texto}</div>
      )}

      <section aria-label="Itens do catálogo" className="cp-grid cp-grid--catalog">
        {CATALOGO.map(item => {
          const { id, nome, preco, categoria, Icone, cor } = item
          const podeResgatar = usuario.pontos >= preco
          const jaResgatou   = usuario.resgates.includes(nome)

          return (
            <article key={id} className={`cp-catalog-item${!podeResgatar && !jaResgatou ? ' cp-catalog-item--locked' : ''}`} aria-label={nome}>

                {/* Ícone lucide em container com cor individual via CSS var */}
                <div className="cp-catalog-item__icon" style={{ '--catalog-cor': cor }}>
                  <Icone size={22} strokeWidth={1.75} />
                </div>

                <div>
                  <div className="cp-catalog-item__cat">{categoria}</div>
                  <div className="cp-catalog-item__nome">{nome}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <div className="cp-catalog-item__preco">{preco} pts</div>
                  {jaResgatou ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--cp-success)', fontWeight: 700 }}>
                      Resgatado
                    </span>
                  ) : (
                    <button
                      className={`btn-cp btn-cp--sm ${podeResgatar ? 'btn-cp--teal' : 'btn-cp--outline'}`}
                      onClick={() => resgatar(item)}
                      disabled={!podeResgatar}
                    >
                      {podeResgatar ? 'Resgatar' : 'Sem saldo'}
                    </button>
                  )}
                </div>

            </article>
          )
        })}
      </section>
    </div>
  )
}
