// src/pages/ChroniclePage/ChroniclePage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'
import PageTransition from '../../components/PageTransition/PageTransition'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import CalendarHeatmap from '../../components/CalendarHeatmap/CalendarHeatmap'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function MonthCard({ entry, index }) {
  const { mes, dias_ativos, total_dias, densidade } = entry
  const nomeMes = MESES[mes - 1] || `Mês ${mes}`
  const pct     = Math.round(densidade * 100)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ y: -2, borderColor: 'var(--accent)' }}
      className="glass rounded-lg p-5 flex flex-col gap-3.5"
    >
      {/* Cabeçalho */}
      <header className="flex justify-between items-center">
        <h3 className="text-[0.92rem] font-extrabold text-[var(--text-primary)] tracking-[-0.01em]">
          {nomeMes}
        </h3>
        <span className="text-[0.68rem] font-semibold text-[var(--text-muted)]">
          {dias_ativos}/{total_dias} dias
        </span>
      </header>

      {/* Calendário do mês — heatmap alinhado pelo dia da semana real */}
      <div aria-label={`Dias ativos em ${nomeMes}: ${dias_ativos} de ${total_dias}`}>
        <CalendarHeatmap
          startWeekday={(() => { const d = new Date(entry.ano, mes - 1, 1); return isNaN(d) ? 0 : d.getDay() })()}
          values={Array.from({ length: total_dias }, (_, i) => (i < dias_ativos ? 1 : 0))}
          cell={22}
          gap={5}
        />
      </div>

      {/* Barra de densidade */}
      <div>
        <div className="flex justify-between text-[0.65rem] text-[var(--text-muted)] mb-[5px] font-semibold tracking-[0.06em]">
          <span>Densidade</span>
          <span className="text-[var(--accent)]">{pct}%</span>
        </div>
        <div className="progress-bar h-[5px]">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.06 + 0.2 }}
          />
        </div>
      </div>
    </motion.article>
  )
}

export default function ChroniclePage() {
  const { estado } = useVitalsWeatherCtx()
  const [dados,     setDados]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [erro,      setErro]      = useState(null)

  useEffect(() => {
    api.getChronicle()
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <header>
          <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--accent)] mb-1">
            Histórico
          </div>
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.025em]">
            The Chronicle
          </h1>
          <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
            Seu histórico de saúde mês a mês — cada quadrado é um dia.
          </p>
        </header>
        <PandaMascot healthState={estado} pose="chronicle" size="sm" />
      </div>

      {/* Estados */}
      {loading && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer-block glass rounded-[18px] h-40" />
          ))}
        </div>
      )}

      {!loading && erro && (
        <div className="glass rounded-2xl p-5 text-[0.82rem] font-semibold !border-[#FF3A3A] bg-[rgba(255,58,58,0.08)] text-[#FF3A3A]">
          {erro}
        </div>
      )}

      {!loading && !erro && dados.length === 0 && (
        <div className="glass rounded-[20px] py-12 px-6 text-center">
          <div className="text-base font-bold text-[var(--text-primary)] mb-1.5">
            Nenhuma entrada ainda
          </div>
          <div className="text-[0.8rem] text-[var(--text-muted)]">
            Complete suas primeiras missões para ver o histórico.
          </div>
        </div>
      )}

      {!loading && dados.length > 0 && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {dados.map((entry, i) => (
            <MonthCard key={`${entry.ano}-${entry.mes}`} entry={entry} index={i} />
          ))}
        </div>
      )}
    </PageTransition>
  )
}
