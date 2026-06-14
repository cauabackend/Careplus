// src/pages/HealthChainsPage/HealthChainsPage.jsx
import { useEffect, useState } from 'react'
import { Link2, UserMinus, Send } from 'lucide-react'
import { api } from '../../services/api'

import PageTransition from '../../components/PageTransition/PageTransition'

export default function HealthChainsPage() {
  const [conexoes,  setConexoes]      = useState([])
  const [eventos,   setEventos]       = useState([])
  const [impacto,   setImpacto]       = useState(0)
  const [loading,   setLoading]       = useState(true)
  const [emailNovo, setEmailNovo]     = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [erroAdd,   setErroAdd]       = useState(null)

  async function carregarDados() {
    try {
      const [c, e, i] = await Promise.all([api.getConexoes(), api.getEventos(), api.getImpacto()])
      setConexoes(c)
      setEventos(e.recebidos ?? [])
      setImpacto(i.pessoas_beneficiadas ?? 0)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { carregarDados() }, [])

  async function handleAdicionar(ev) {
    ev.preventDefault()
    if (!emailNovo.trim()) return
    setAdicionando(true)
    setErroAdd(null)
    try {
      await api.criarConexao({ destino_email: emailNovo.trim() })
      setEmailNovo('')
      await carregarDados()
    } catch (err) {
      setErroAdd(err.data?.detail || err.data?.erro || 'Não foi possível adicionar este amigo.')
    } finally {
      setAdicionando(false)
    }
  }

  async function handleRemover(id) {
    try {
      await api.removerConexao(id)
      setConexoes(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  const nomeAmigo   = c => c.destino?.first_name || c.destino?.username || 'Amigo'
  const inicialAmigo = c => nomeAmigo(c).charAt(0).toUpperCase()

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <header className="mb-8">
        <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--accent)] mb-1">
          Social
        </div>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.025em]">
          Health Chains
        </h1>
        <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
          Conecte-se com amigos e motivem-se mutuamente.
        </p>
      </header>

      {/* Impacto anual */}
      <div
        className="glass rounded-[18px] py-[18px] px-[22px] flex items-center gap-4 mb-5 !border-[var(--accent)] bg-[var(--accent-soft)]"
      >
        <div className="w-11 h-11 rounded-[14px] bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 border border-[var(--accent)]">
          <Link2 size={20} className="text-[var(--accent)]" />
        </div>
        <div>
          <div className="text-[1.6rem] font-extrabold text-[var(--accent)] tracking-[-0.02em] leading-none">
            {impacto}
          </div>
          <div className="text-[0.72rem] text-[var(--text-muted)] font-semibold">
            pessoas beneficiadas este ano
          </div>
        </div>
      </div>

      {/* Adicionar amigo */}
      <section className="mb-6">
        <div className="text-[0.72rem] font-bold text-[var(--text-muted)] tracking-[0.08em] mb-2.5 uppercase">
          Adicionar amigo
        </div>
        <form onSubmit={handleAdicionar} className="flex gap-2">
          <input
            type="email"
            value={emailNovo}
            onChange={ev => setEmailNovo(ev.target.value)}
            placeholder="email@amigo.com"
            aria-label="Email do amigo"
            className="flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl py-2.5 px-3.5 text-[var(--text-primary)] text-[0.82rem] outline-none"
            style={{ fontFamily: 'inherit' }}
            onFocus={ev => { ev.target.style.borderColor = 'var(--accent)' }}
            onBlur={ev  => { ev.target.style.borderColor = 'var(--card-border)' }}
          />
          <button
            type="submit"
            disabled={adicionando}
            className="flex items-center gap-1.5 bg-[var(--accent)] text-[#fff] text-[0.72rem] font-extrabold tracking-[0.06em] uppercase py-2.5 px-4 rounded-xl border-none flex-shrink-0"
            style={{
              cursor: adicionando ? 'not-allowed' : 'pointer',
              opacity: adicionando ? 0.6 : 1,
              fontFamily: 'inherit',
              boxShadow: '0 0 12px var(--accent-glow)',
            }}
          >
            <Send size={14} strokeWidth={2.5} />
            {adicionando ? '...' : 'Adicionar'}
          </button>
        </form>
        {erroAdd && (
          <div className="text-[0.75rem] text-[#FF3A3A] mt-2 font-semibold">
            {erroAdd}
          </div>
        )}
      </section>

      {/* Lista de amigos */}
      <section className="mb-6">
        <div className="text-[0.72rem] font-bold text-[var(--text-muted)] tracking-[0.08em] mb-2.5 uppercase">
          Amigos conectados ({conexoes.length})
        </div>

        {loading && (
          <div className="flex flex-col gap-2">
            {[1, 2].map(i => (
              <div key={i} className="shimmer-block glass rounded-[14px] h-[60px]" />
            ))}
          </div>
        )}

        {!loading && conexoes.length === 0 && (
          <div className="glass rounded-2xl py-7 px-5 text-center">
            <div className="text-[0.85rem] text-[var(--text-muted)]">
              Nenhum amigo conectado. Adicione alguém pelo email.
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
            {conexoes.map((c) => (
              <div
                key={c.id}
                className="glass rounded-[14px] py-3 px-4 flex items-center gap-3"
                style={{
                  transition: 'opacity 0.2s',
                }}
              >
                <div className="w-9 h-9 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 border border-[var(--accent)]">
                  <span className="text-[var(--accent)] font-extrabold text-[0.85rem]">
                    {inicialAmigo(c)}
                  </span>
                </div>
                <span className="flex-1 text-[0.85rem] font-bold text-[var(--text-primary)]">
                  {nomeAmigo(c)}
                </span>
                <button
                  onClick={() => handleRemover(c.id)}
                  aria-label={`Remover ${nomeAmigo(c)}`}
                  className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 rounded-lg flex"
                >
                  <UserMinus size={16} />
                </button>
              </div>
            ))}
          </div>
      </section>

      {/* Atividade recente */}
      {eventos.length > 0 && (
        <section>
          <div className="text-[0.72rem] font-bold text-[var(--text-muted)] tracking-[0.08em] mb-2.5 uppercase">
            Atividade recente
          </div>
          <div className="flex flex-col gap-2">
            {eventos.map(ev => (
              <div key={ev.id} className="glass rounded-[14px] py-3 px-4">
                <span className="font-bold text-[var(--accent)]">
                  {ev.origem?.first_name || ev.origem?.username}
                </span>
                <span className="text-[var(--text-muted)] text-[0.8rem]">
                  {' completou '}{ev.missao}{' e beneficiou você'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  )
}
