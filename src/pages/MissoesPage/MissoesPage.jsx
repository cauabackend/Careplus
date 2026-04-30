import { useState, useEffect } from 'react'
import { HeartPulse, RefreshCw } from 'lucide-react'
import MissionCard from '../../components/MissionCard/MissionCard'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'
import { buscarDadosSaude } from '../../services/mockHealthApi'

const CHAVE_SYNC = 'careplus_ultimo_sync'

export default function MissoesPage({ usuario, setUsuario }) {
  const [sincronizando, setSincronizando] = useState(false)
  const [ultimoSync, setUltimoSync]       = useState(null)
  const [mensagem, setMensagem]           = useState(null)

  // Recupera o último sync do localStorage ao montar o componente
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_SYNC)
    if (salvo) setUltimoSync(JSON.parse(salvo))
  }, [])

  async function sincronizar() {
    setSincronizando(true)
    setMensagem(null)
    try {
      const dados = await buscarDadosSaude()
      localStorage.setItem(CHAVE_SYNC, JSON.stringify(dados))
      setUltimoSync(dados)
    } finally {
      setSincronizando(false)
    }
  }

  function salvarProgresso() {
    if (!ultimoSync) return

    let pontosGanhos = 0
    const novasMissoes = [...usuario.missoes_concluidas]
    const novasBadges  = [...usuario.badges]

    MISSOES_CONFIG.forEach(({ chave, badge }) => {
      const bateuMeta      = ultimoSync[chave] >= METAS[chave]
      const jaContabilizou = novasMissoes.includes(chave)

      if (bateuMeta && !jaContabilizou) {
        pontosGanhos += PONTOS_POR_MISSAO[chave]
        novasMissoes.push(chave)
        if (!novasBadges.includes(badge))             novasBadges.push(badge)
        if (!novasBadges.includes('primeira_missao')) novasBadges.push('primeira_missao')
      }
    })

    setUsuario({
      ...usuario,
      dados:              { passos: ultimoSync.passos, agua: ultimoSync.agua, sono: ultimoSync.sono },
      pontos:             usuario.pontos + pontosGanhos,
      streak:             pontosGanhos > 0 ? usuario.streak + 1 : usuario.streak,
      missoes_concluidas: novasMissoes,
      badges:             novasBadges,
    })

    setMensagem(
      pontosGanhos > 0
        ? { tipo: 'success', texto: `+${pontosGanhos} pts conquistados! Continue assim.` }
        : { tipo: 'info',    texto: 'Progresso salvo. Continue batendo suas metas.' }
    )
  }

  function formatarHora(iso) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <header className="mb-4">
        <div className="cp-page-label">Hoje</div>
        <h1 className="cp-page-title">Missões do Dia</h1>
        <p style={{ color: 'var(--cp-muted)', fontSize: '0.875rem', marginTop: '4px', transition: 'color .35s' }}>
          Sincronize com o Google Health para importar seus dados automaticamente.
        </p>
      </header>

      {/* Barra de sincronização */}
      <div className="cp-sync-bar">
        {sincronizando
          ? <div className="cp-sync-spinner" />
          : <HeartPulse size={20} strokeWidth={1.75} className="cp-sync-bar__icon" />
        }
        <div className="cp-sync-bar__text">
          <div className="cp-sync-bar__label">
            {sincronizando ? 'Sincronizando…' : 'Google Health'}
          </div>
          <div className="cp-sync-bar__source">
            {ultimoSync
              ? `Último sync: ${ultimoSync.fonte}`
              : 'Nenhuma sincronização realizada hoje'
            }
          </div>
        </div>
        {ultimoSync && !sincronizando && (
          <span className="cp-sync-bar__time">{formatarHora(ultimoSync.dataSync)}</span>
        )}
        <button
          className="btn-cp btn-cp--teal btn-cp--sm"
          onClick={sincronizar}
          disabled={sincronizando}
        >
          {sincronizando
            ? 'Aguarde…'
            : <><RefreshCw size={14} strokeWidth={2} /> Sincronizar</>
          }
        </button>
      </div>

      {mensagem && (
        <div className={`cp-alert cp-alert--${mensagem.tipo} mb-4`}>
          {mensagem.texto}
        </div>
      )}

      {/* Estado vazio */}
      {!ultimoSync && !sincronizando && (
        <div className="cp-empty">
          <div className="cp-empty__icon">
            <HeartPulse size={40} strokeWidth={1.5} style={{ color: 'var(--cp-border)' }} />
          </div>
          <p>Clique em <strong>Sincronizar</strong> para importar seus dados de saúde.</p>
        </div>
      )}

      {/* Cards de missão */}
      {ultimoSync && (
        <section aria-label="Missões do dia">
          <div className="cp-grid cp-grid--missions mb-4">
            {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade, cor }) => (
              <MissionCard
                key={chave}
                titulo={titulo}
                Icone={Icone}
                meta={METAS[chave]}
                atual={ultimoSync[chave]}
                unidade={unidade}
                pontos={PONTOS_POR_MISSAO[chave]}
                concluida={usuario.missoes_concluidas.includes(chave)}
                cor={cor}
                sincronizado={true}
              />
            ))}
          </div>
          <button className="btn-cp btn-cp--teal" onClick={salvarProgresso} disabled={sincronizando}>
            Salvar Progresso
          </button>
        </section>
      )}
    </div>
  )
}
