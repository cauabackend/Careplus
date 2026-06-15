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
      await api.salvarProgresso({
        passos: dados.passos, agua: dados.agua, sono: dados.sono, fonte: dados.fonte,
        batimentos: dados.batimentos, spo2: dados.spo2, temperatura: dados.temperatura,
      })
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
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--accent)] mb-1">
            Hoje
          </div>
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.025em]">
            Missões
          </h1>
          <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
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
      <div className="glass rounded-2xl py-3.5 px-[18px] flex items-center gap-3 mb-5">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: sincronizando ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: sincronizando ? '0 0 8px var(--accent)' : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[0.82rem] font-bold text-[var(--text-primary)]">
            {sincronizando ? 'Sincronizando...' : 'Google Health'}
          </div>
          <div className="text-[0.72rem] text-[var(--text-muted)] overflow-hidden text-ellipsis whitespace-nowrap">
            {progresso
              ? `Atualizado — ${dados.passos.toLocaleString('pt-BR')} passos`
              : 'Nenhuma sincronização hoje'}
          </div>
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          className="flex items-center gap-1.5 bg-[var(--accent)] text-[#fff] text-[0.7rem] font-extrabold tracking-[0.06em] uppercase py-2 px-4 rounded-full border-none flex-shrink-0"
          style={{
            cursor: sincronizando ? 'not-allowed' : 'pointer',
            opacity: sincronizando ? 0.55 : 1,
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
          className="text-[0.8rem] font-semibold rounded-xl py-3 px-4 mb-4 border"
          style={{
            background: mensagem.tipo === 'success' ? 'rgba(45,215,95,0.12)' : 'rgba(255,58,58,0.12)',
            color:      mensagem.tipo === 'success' ? '#2DD75F'              : '#FF3A3A',
            borderColor: mensagem.tipo === 'success' ? 'rgba(45,215,95,0.3)' : 'rgba(255,58,58,0.3)',
            transition: 'opacity 0.3s',
          }}
        >
          {mensagem.texto}
        </div>
      )}

      {/* Shimmer loading */}
      {loading && (
        <div className="grid gap-3" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        }}>
          {MISSOES_CONFIG.map((_, i) => (
            <div
              key={i}
              className="shimmer-block glass rounded-[18px] h-[140px]"
            />
          ))}
        </div>
      )}

      {/* Cards de missão */}
      {!loading && (
        <section aria-label="Missões do dia" className="grid gap-3" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        }}>
          {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade }) => {
            const concluida = missoesConcluidas.includes(chave)
            const atingida  = progresso && (dados[chave] ?? 0) >= METAS[chave]
            return (
              <div key={chave} className="flex flex-col gap-2">
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
                    className="flex items-center justify-center gap-1.5 w-full p-2.5 border border-[var(--accent)] rounded-xl text-[0.72rem] font-extrabold tracking-[0.06em] uppercase cursor-pointer"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
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
