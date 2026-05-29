import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useVitalsWeather } from '../../hooks/useVitalsWeather'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import { Link2, UserMinus, UserPlus } from 'lucide-react'

export default function HealthChainsPage() {
  const [conexoes, setConexoes] = useState([])
  const [eventos, setEventos] = useState([])
  const [impacto, setImpacto] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [emailNovo, setEmailNovo] = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [erroAdicionar, setErroAdicionar] = useState(null)
  const { estado } = useVitalsWeather()

  async function carregarDados() {
    try {
      const [c, e, i] = await Promise.all([
        api.getConexoes(),
        api.getEventos(),
        api.getImpacto(),
      ])
      setConexoes(c)
      setEventos(e)
      setImpacto(i.total_beneficiados ?? 0)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar as conexões. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregarDados() }, [])

  async function handleAdicionar(e) {
    e.preventDefault()
    if (!emailNovo.trim()) return
    setAdicionando(true)
    setErroAdicionar(null)
    try {
      await api.criarConexao({ email: emailNovo.trim() })
      setEmailNovo('')
      await carregarDados()
    } catch (err) {
      setErroAdicionar(err.data?.detail || 'Não foi possível adicionar este amigo.')
    } finally {
      setAdicionando(false)
    }
  }

  async function handleRemover(id) {
    try {
      await api.removerConexao(id)
      setConexoes((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const nomeAmigo = (c) => c.destino?.first_name || c.destino?.username || 'Amigo'
  const inicialAmigo = (c) => nomeAmigo(c).charAt(0).toUpperCase()

  return (
    <main className="flex flex-col gap-6" aria-label="Health Chains">
      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="font-sora font-bold text-2xl text-text dark:text-d-text">Health Chains</h1>
          <p className="text-muted dark:text-d-muted text-sm mt-1">
            Conecte-se com amigos e motivem-se mutuamente.
          </p>
        </div>
        <PandaMascot healthState={estado} pageContext="chains" size="md" />
      </header>

      {/* Impacto anual */}
      <div className="bg-cp-navy rounded-xl2 p-4 flex items-center gap-3">
        <Link2 className="text-cp-teal" size={22} />
        <div>
          <p className="font-sora font-bold text-xl text-white">{impacto}</p>
          <p className="text-white/60 text-xs">pessoas beneficiadas este ano</p>
        </div>
      </div>

      {/* Adicionar amigo */}
      <section aria-label="Adicionar amigo">
        <h2 className="font-sora font-semibold text-base text-text dark:text-d-text mb-2">Adicionar amigo</h2>
        <form onSubmit={handleAdicionar} className="flex gap-2">
          <input
            type="email"
            value={emailNovo}
            onChange={(e) => setEmailNovo(e.target.value)}
            placeholder="Email do amigo"
            aria-label="Email do amigo"
            className="flex-1 rounded-lg border border-border dark:border-d-border bg-white dark:bg-d-card text-text dark:text-d-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-teal"
          />
          <button
            type="submit"
            disabled={adicionando}
            className="flex items-center gap-1 bg-cp-teal text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-cp-teal/90 disabled:opacity-50 transition-colors"
          >
            <UserPlus size={16} />
            {adicionando ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
        {erroAdicionar && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-1">{erroAdicionar}</p>
        )}
      </section>

      {/* Erros de carregamento */}
      {erro && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl2 p-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {/* Lista de amigos */}
      <section aria-label="Amigos conectados">
        <h2 className="font-sora font-semibold text-base text-text dark:text-d-text mb-3">
          Amigos conectados ({conexoes.length})
        </h2>
        {carregando && <p className="text-muted dark:text-d-muted text-sm animate-pulse">Carregando…</p>}
        {!carregando && conexoes.length === 0 && (
          <p className="text-muted dark:text-d-muted text-sm">
            Nenhum amigo conectado ainda. Adicione alguém pelo email!
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {conexoes.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 bg-white dark:bg-d-card rounded-xl2 border border-border dark:border-d-border p-3"
            >
              <div className="w-9 h-9 rounded-full bg-cp-teal/20 flex items-center justify-center">
                <span className="font-sora font-bold text-cp-teal text-sm">{inicialAmigo(c)}</span>
              </div>
              <span className="flex-1 text-sm text-text dark:text-d-text font-medium">{nomeAmigo(c)}</span>
              <button
                onClick={() => handleRemover(c.id)}
                aria-label={`Remover ${nomeAmigo(c)}`}
                className="text-muted dark:text-d-muted hover:text-red-500 transition-colors"
              >
                <UserMinus size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Eventos recebidos */}
      {eventos.length > 0 && (
        <section aria-label="Eventos recebidos">
          <h2 className="font-sora font-semibold text-base text-text dark:text-d-text mb-3">
            Atividade recente
          </h2>
          <ul className="flex flex-col gap-2">
            {eventos.map((ev) => (
              <li
                key={ev.id}
                className="text-sm text-muted dark:text-d-muted bg-white dark:bg-d-card rounded-xl2 border border-border dark:border-d-border px-3 py-2"
              >
                <span className="text-text dark:text-d-text font-medium">{ev.origem?.first_name || ev.origem?.username}</span>
                {' completou '}
                <span className="text-cp-teal font-medium">{ev.missao}</span>
                {' e beneficiou você!'}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
