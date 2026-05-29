import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useVitalsWeather } from '../../hooks/useVitalsWeather'
import PandaMascot from '../../components/PandaMascot/PandaMascot'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function BookPage({ entry }) {
  const { mes, dias_ativos, total_dias, densidade } = entry
  const nomeMes = MESES[mes - 1] || `Mês ${mes}`
  // Render lines representing days; active days are filled
  const lines = Array.from({ length: total_dias }, (_, i) => i < dias_ativos)

  return (
    <article className="bg-white dark:bg-d-card rounded-xl2 border border-border dark:border-d-border p-5 flex flex-col gap-3 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="font-sora font-semibold text-base text-text dark:text-d-text">{nomeMes}</h3>
        <span className="text-xs text-muted dark:text-d-muted">{dias_ativos}/{total_dias} dias</span>
      </header>
      <div className="grid grid-cols-6 gap-1" aria-label={`Dias ativos em ${nomeMes}`}>
        {lines.map((ativo, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-colors ${ativo ? 'bg-cp-teal' : 'bg-border dark:bg-d-border'}`}
            aria-label={ativo ? 'Dia ativo' : 'Dia inativo'}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 rounded-full bg-cp-teal transition-all"
          style={{ width: `${Math.round(densidade * 100)}%` }}
          aria-label={`Densidade: ${Math.round(densidade * 100)}%`}
        />
        <span className="text-xs text-muted dark:text-d-muted ml-auto">{Math.round(densidade * 100)}%</span>
      </div>
    </article>
  )
}

export default function ChroniclePage() {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const { estado } = useVitalsWeather()

  useEffect(() => {
    api.getChronicle()
      .then(setDados)
      .catch((e) => {
        console.error(e)
        setErro('Não foi possível carregar o histórico. Tente novamente.')
      })
      .finally(() => setCarregando(false))
  }, [])

  return (
    <main className="flex flex-col gap-6" aria-label="The Chronicle">
      <header className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="font-sora font-bold text-2xl text-text dark:text-d-text">The Chronicle</h1>
          <p className="text-muted dark:text-d-muted text-sm mt-1">
            Seu histórico de saúde mês a mês — cada linha é um dia ativo.
          </p>
        </div>
        <PandaMascot healthState={estado} pageContext="chronicle" size="md" />
      </header>

      {carregando && (
        <p className="text-muted dark:text-d-muted text-sm animate-pulse">Carregando histórico…</p>
      )}

      {!carregando && erro && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl2 p-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {!carregando && dados.length === 0 && (
        <div className="bg-white dark:bg-d-card rounded-xl2 border border-border dark:border-d-border p-8 text-center">
          <p className="text-muted dark:text-d-muted">Nenhuma entrada ainda. Complete suas primeiras missões!</p>
        </div>
      )}

      {!carregando && dados.length > 0 && (
        <section
          className="grid gap-4 sm:grid-cols-2"
          aria-label="Páginas do Chronicle"
        >
          {dados.map((entry) => (
            <BookPage key={`${entry.ano}-${entry.mes}`} entry={entry} />
          ))}
        </section>
      )}
    </main>
  )
}
