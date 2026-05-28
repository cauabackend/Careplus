import { useState, useEffect } from 'react'
import { HeartPulse, RefreshCw } from 'lucide-react'
import { useAuth }    from '../../context/AuthContext'
import { api }        from '../../services/api'
import MissionCard    from '../../components/MissionCard/MissionCard'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'

export default function MissoesPage() {
  const { refreshUsuario }        = useAuth()
  const [sincronizando, setSinc]  = useState(false)
  const [progresso,    setProg]   = useState(null)
  const [missoes,      setMissoes]= useState([])
  const [mensagem,     setMsg]    = useState(null)

  async function carregarDados() {
    const [prog, miss] = await Promise.all([api.getProgresso(), api.getMissoes()])
    setProg(prog)
    setMissoes(miss)
  }

  useEffect(() => { carregarDados() }, [])

  async function sincronizar() {
    setSinc(true)
    setMsg(null)
    try {
      // Simula busca do Google Health (mock)
      const { buscarDadosSaude } = await import('../../services/mockHealthApi')
      const dados = await buscarDadosSaude()
      await api.salvarProgresso({ passos: dados.passos, agua: dados.agua, sono: dados.sono, fonte: dados.fonte })
      await carregarDados()
      setMsg({ tipo: 'success', texto: 'Dados sincronizados com sucesso!' })
    } catch {
      setMsg({ tipo: 'error', texto: 'Erro ao sincronizar. Tente novamente.' })
    } finally {
      setSinc(false)
    }
  }

  async function concluirMissao(chave) {
    try {
      await api.concluirMissao({ chave_missao: chave })
      await carregarDados()
      await refreshUsuario()
      setMsg({ tipo: 'success', texto: `Missão "${chave}" concluída! Pontos adicionados.` })
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.data?.erro || 'Erro ao concluir missão.' })
    }
  }

  const dados           = progresso ?? { passos: 0, agua: 0, sono: 0 }
  const missoesConcluidas = missoes.map(m => m.chave_missao)

  return (
    <div>
      <header className="mb-6">
        <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Hoje</div>
        <h1 className="font-sora text-2xl font-extrabold text-text dark:text-d-text mt-0.5">Missões do Dia</h1>
        <p className="text-sm text-muted dark:text-d-muted mt-1">
          Sincronize com o Google Health para importar seus dados.
        </p>
      </header>

      {/* Barra de sync */}
      <div className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-4 flex items-center gap-3 mb-4">
        {sincronizando
          ? <div className="w-5 h-5 rounded-full border-2 border-cp-teal border-t-transparent animate-spin flex-shrink-0" />
          : <HeartPulse size={20} strokeWidth={1.75} className="text-cp-teal flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text dark:text-d-text">
            {sincronizando ? 'Sincronizando…' : 'Google Health'}
          </div>
          <div className="text-xs text-muted dark:text-d-muted truncate">
            {progresso ? `Sync realizado — ${dados.passos.toLocaleString('pt-BR')} passos` : 'Nenhuma sincronização hoje'}
          </div>
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          className="flex items-center gap-1.5 bg-cp-teal hover:bg-[#00a8c4] disabled:opacity-60 text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors flex-shrink-0"
        >
          <RefreshCw size={13} strokeWidth={2} />
          {sincronizando ? 'Aguarde…' : 'Sincronizar'}
        </button>
      </div>

      {/* Alerta */}
      {mensagem && (
        <div
          role="alert"
          className={`text-sm rounded-xl px-4 py-3 mb-4 ${
            mensagem.tipo === 'success'
              ? 'bg-cp-success/10 text-cp-success border border-cp-success/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {/* Cards de missão */}
      <section aria-label="Missões do dia" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade, cor }) => {
          const concluida = missoesConcluidas.includes(chave)
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
                cor={cor}
              />
              {!concluida && progresso && dados[chave] >= METAS[chave] && (
                <button
                  onClick={() => concluirMissao(chave)}
                  className="w-full bg-cp-success/10 hover:bg-cp-success/20 text-cp-success text-xs font-semibold rounded-full py-2 transition-colors"
                >
                  ✓ Marcar como concluída (+{PONTOS_POR_MISSAO[chave]} pts)
                </button>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
