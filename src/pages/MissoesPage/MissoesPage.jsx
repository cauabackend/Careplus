// src/pages/MissoesPage/MissoesPage.jsx
import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Check } from 'lucide-react'
import { useAuth }    from '../../context/AuthContext'
import { api }        from '../../services/api'
import MissionCard    from '../../components/MissionCard/MissionCard'
import PandaMascot    from '../../components/PandaMascot/PandaMascot'
import PageTransition from '../../components/PageTransition/PageTransition'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

export default function MissoesPage() {
  const { refreshUsuario }        = useAuth()
  const { estado, refresh: refreshVitals } = useVitalsWeatherCtx()
  const [sincronizando, setSinc]  = useState(false)
  const [progresso,    setProg]   = useState(null)
  const [missoes,      setMissoes]= useState([])
  const [mensagem,     setMsg]    = useState(null)
  const [loading,      setLoading]= useState(true)
  const [eventoPanda,  setEvento] = useState(null)
  const msgTimerRef               = useRef(null)

  function mostrarMsg(tipo, texto) {
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current)
    setMsg({ tipo, texto })
    msgTimerRef.current = setTimeout(() => setMsg(null), 3500)
  }

  async function carregarDados() {
    try {
      const [prog, miss] = await Promise.all([api.getProgresso(), api.getMissoes()])
      setProg(prog ?? null)
      setMissoes(Array.isArray(miss) ? miss : (miss?.results ?? []))
    } catch {
      // silently keep previous state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
    return () => { if (msgTimerRef.current) clearTimeout(msgTimerRef.current) }
  }, [])

  async function sincronizar() {
    setSinc(true)
    try {
      const { buscarDadosSaude } = await import('../../services/mockHealthApi')
      const dados = await buscarDadosSaude()
      await api.salvarProgresso({ passos: dados.passos, agua: dados.agua, sono: dados.sono, fonte: dados.fonte })
      await carregarDados()
      refreshVitals()
      mostrarMsg('success', 'Dados sincronizados com sucesso.')
    } catch {
      mostrarMsg('error', 'Erro ao sincronizar. Tente novamente.')
    } finally {
      setSinc(false)
    }
  }

  async function concluirMissao(chave) {
    try {
      await api.concluirMissao({ chave_missao: chave })
      await carregarDados()
      await refreshUsuario()
      refreshVitals()
      mostrarMsg('success', 'Missão concluída! Pontos adicionados.')
      setEvento('mission_complete')
      setTimeout(() => setEvento(null), 700)
    } catch (err) {
      mostrarMsg('error', err.data?.erro || 'Erro ao concluir missão.')
    }
  }

  const dados = {
    passos: progresso?.passos ?? 0,
    agua:   progresso?.agua   ?? 0,
    sono:   progresso?.sono   ?? 0,
  }
  const missoesConcluidas = Array.isArray(missoes) ? missoes.map(m => m.chave_missao) : []

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
          }}>
            Hoje
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
          }}>
            Missões
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Complete suas metas diárias de saúde.
          </p>
        </div>
        <PandaMascot
          healthState={estado}
          pose={missoesConcluidas.length > 0 ? 'missions-dance' : 'missions-point'}
          size="sm"
          event={eventoPanda}
        />
      </div>

      {/* Barra de sync */}
      <div className="glass" style={{
        borderRadius: '16px', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: sincronizando ? 'var(--accent)' : 'var(--text-muted)',
          boxShadow: sincronizando ? '0 0 8px var(--accent)' : 'none',
          flexShrink: 0,
          transition: 'background 0.3s, box-shadow 0.3s',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.82rem', fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
            {sincronizando ? 'Sincronizando...' : 'Google Health'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {progresso
              ? `Atualizado — ${dados.passos.toLocaleString('pt-BR')} passos`
              : 'Nenhuma sincronização hoje'}
          </div>
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.7rem', fontWeight: '800',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '8px 16px', borderRadius: '999px', border: 'none',
            cursor: sincronizando ? 'not-allowed' : 'pointer',
            opacity: sincronizando ? 0.55 : 1,
            flexShrink: 0,
            fontFamily: 'inherit',
            boxShadow: '0 0 12px var(--accent-glow)',
            transition: 'opacity 0.18s',
          }}
        >
          <RefreshCw
            size={13}
            strokeWidth={2.5}
            style={{ animation: sincronizando ? 'spin 1s linear infinite' : 'none' }}
          />
          {sincronizando ? 'Aguarde' : 'Sincronizar'}
        </button>
      </div>

      {/* Mensagem (auto-dismiss) */}
      {mensagem && (
        <div
          role="alert"
          style={{
            fontSize: '0.8rem', fontWeight: '600',
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '16px',
            background: mensagem.tipo === 'success' ? 'rgba(45,215,95,0.12)' : 'rgba(255,58,58,0.12)',
            color:      mensagem.tipo === 'success' ? '#2DD75F'              : '#FF3A3A',
            border:     `1px solid ${mensagem.tipo === 'success' ? 'rgba(45,215,95,0.3)' : 'rgba(255,58,58,0.3)'}`,
            transition: 'opacity 0.3s',
          }}
        >
          {mensagem.texto}
        </div>
      )}

      {/* Shimmer loading */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
        }}>
          {MISSOES_CONFIG.map((_, i) => (
            <div
              key={i}
              className="shimmer-block glass"
              style={{ borderRadius: '18px', height: '140px' }}
            />
          ))}
        </div>
      )}

      {/* Cards de missão */}
      {!loading && (
        <section aria-label="Missões do dia" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
        }}>
          {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade }) => {
            const concluida = missoesConcluidas.includes(chave)
            const atingida  = progresso && (dados[chave] ?? 0) >= METAS[chave]
            return (
              <div key={chave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <MissionCard
                  titulo={titulo}
                  Icone={Icone}
                  meta={METAS[chave]}
                  atual={dados[chave] ?? 0}
                  unidade={unidade}
                  pontos={PONTOS_POR_MISSAO[chave]}
                  concluida={concluida}
                />
                {!concluida && atingida && (
                  <button
                    onClick={() => concluirMissao(chave)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      width: '100%', padding: '10px',
                      background: 'var(--accent-soft)',
                      border: '1px solid var(--accent)',
                      borderRadius: '12px',
                      color: 'var(--accent)',
                      fontSize: '0.72rem', fontWeight: '800',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)' }}
                  >
                    <Check size={14} strokeWidth={3} />
                    Concluir (+{PONTOS_POR_MISSAO[chave]} pts)
                  </button>
                )}
              </div>
            )
          })}
        </section>
      )}
    </PageTransition>
  )
}
