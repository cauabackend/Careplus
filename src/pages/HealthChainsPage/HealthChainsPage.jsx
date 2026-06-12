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
      <header style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: '700',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '4px',
        }}>
          Social
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
        }}>
          Health Chains
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Conecte-se com amigos e motivem-se mutuamente.
        </p>
      </header>

      {/* Impacto anual */}
      <div
        className="glass"
        style={{
          borderRadius: '18px', padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '20px',
          borderColor: 'var(--accent)',
          background: 'var(--accent-soft)',
        }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid var(--accent)',
        }}>
          <Link2 size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <div style={{
            fontSize: '1.6rem', fontWeight: '800',
            color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {impacto}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            pessoas beneficiadas este ano
          </div>
        </div>
      </div>

      {/* Adicionar amigo */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: '700',
          color: 'var(--text-muted)', letterSpacing: '0.08em',
          marginBottom: '10px', textTransform: 'uppercase',
        }}>
          Adicionar amigo
        </div>
        <form onSubmit={handleAdicionar} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="email"
            value={emailNovo}
            onChange={ev => setEmailNovo(ev.target.value)}
            placeholder="email@amigo.com"
            aria-label="Email do amigo"
            style={{
              flex: 1,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onFocus={ev => { ev.target.style.borderColor = 'var(--accent)' }}
            onBlur={ev  => { ev.target.style.borderColor = 'var(--card-border)' }}
          />
          <button
            type="submit"
            disabled={adicionando}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.72rem', fontWeight: '800',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '10px 16px', borderRadius: '12px', border: 'none',
              cursor: adicionando ? 'not-allowed' : 'pointer',
              opacity: adicionando ? 0.6 : 1,
              fontFamily: 'inherit',
              boxShadow: '0 0 12px var(--accent-glow)',
              flexShrink: 0,
            }}
          >
            <Send size={14} strokeWidth={2.5} />
            {adicionando ? '...' : 'Adicionar'}
          </button>
        </form>
        {erroAdd && (
          <div style={{
            fontSize: '0.75rem', color: '#FF3A3A', marginTop: '8px', fontWeight: '600',
          }}>
            {erroAdd}
          </div>
        )}
      </section>

      {/* Lista de amigos */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: '700',
          color: 'var(--text-muted)', letterSpacing: '0.08em',
          marginBottom: '10px', textTransform: 'uppercase',
        }}>
          Amigos conectados ({conexoes.length})
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2].map(i => (
              <div key={i} className="shimmer-block glass" style={{ borderRadius: '14px', height: '60px' }} />
            ))}
          </div>
        )}

        {!loading && conexoes.length === 0 && (
          <div className="glass" style={{
            borderRadius: '16px', padding: '28px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nenhum amigo conectado. Adicione alguém pelo email.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conexoes.map((c) => (
              <div
                key={c.id}
                className="glass"
                style={{
                  borderRadius: '14px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, border: '1px solid var(--accent)',
                }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '0.85rem' }}>
                    {inicialAmigo(c)}
                  </span>
                </div>
                <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {nomeAmigo(c)}
                </span>
                <button
                  onClick={() => handleRemover(c.id)}
                  aria-label={`Remover ${nomeAmigo(c)}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px', borderRadius: '8px',
                    display: 'flex',
                  }}
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
          <div style={{
            fontSize: '0.72rem', fontWeight: '700',
            color: 'var(--text-muted)', letterSpacing: '0.08em',
            marginBottom: '10px', textTransform: 'uppercase',
          }}>
            Atividade recente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {eventos.map(ev => (
              <div key={ev.id} className="glass" style={{ borderRadius: '14px', padding: '12px 16px' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
                  {ev.origem?.first_name || ev.origem?.username}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
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
