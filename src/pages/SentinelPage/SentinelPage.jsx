// src/pages/SentinelPage/SentinelPage.jsx
import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useVitalsWeather } from '../../hooks/useVitalsWeather';
import PandaMascot from '../../components/PandaMascot/PandaMascot';

const TIPO_LABEL = {
  sleep_debt:     'Déficit de Sono',
  hydration_low:  'Hidratação Baixa',
  burnout_risk:   'Risco de Burnout',
  streak_break:   'Streak em Risco',
};

const TIPO_STYLE = {
  sleep_debt:    'text-blue-300 bg-blue-900/30 border-blue-700/40',
  hydration_low: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/40',
  burnout_risk:  'text-red-300  bg-red-900/30  border-red-700/40',
  streak_break:  'text-amber-300 bg-amber-900/30 border-amber-700/40',
};

export default function SentinelPage() {
  const { estado } = useVitalsWeather();
  const [alertas, setAlertas]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pandaEvent, setPandaEvent] = useState('app_open');

  const ativos = alertas.filter(a => !a.lido);
  const lidos  = alertas.filter(a =>  a.lido);

  useEffect(() => {
    api.getSentinel()
      .then(data => {
        setAlertas(data);
        if (data.some(a => !a.lido)) {
          setPandaEvent('alert_triggered');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const marcarLido = async (id) => {
    try {
      await api.marcarAlertaLido(id);
      setAlertas(prev =>
        prev.map(a => (a.id === id ? { ...a, lido: true } : a))
      );
    } catch (err) {
      console.error('Erro ao marcar alerta:', err);
    }
  };

  return (
    <main className="min-h-screen bg-cp-navy text-white p-6 max-w-2xl mx-auto">
      <header className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-cp-teal" />
            <h1 className="text-2xl font-bold tracking-tight">SENTINEL</h1>
          </div>
          <p className="text-white/40 text-sm">
            Monitoramento inteligente dos últimos 14 dias
          </p>
        </div>
        <PandaMascot
          healthState={ativos.length > 0 ? 'warning' : estado}
          pageContext="sentinel"
          event={pandaEvent}
          size="sm"
        />
      </header>

      {loading && (
        <p className="text-white/40 text-sm">Analisando seus dados...</p>
      )}

      {!loading && ativos.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl border border-white/5 bg-white/3"
          role="status"
          aria-live="polite"
        >
          <p className="text-cp-success text-lg font-semibold">
            Tudo certo por aqui!
          </p>
          <p className="text-white/40 text-sm mt-2">
            Nenhum alerta ativo nos últimos 14 dias.
          </p>
        </div>
      )}

      {ativos.length > 0 && (
        <section aria-label="Alertas ativos" className="space-y-3 mb-8">
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            {ativos.length} alerta{ativos.length > 1 ? 's' : ''} ativo{ativos.length > 1 ? 's' : ''}
          </h2>
          {ativos.map(alerta => (
            <article
              key={alerta.id}
              className={`border rounded-xl p-4 flex items-start justify-between gap-4 ${
                TIPO_STYLE[alerta.tipo] ?? 'text-white/70 bg-white/5 border-white/10'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
                </p>
                <p className="text-xs opacity-75 mt-1 leading-relaxed">
                  {alerta.mensagem}
                </p>
              </div>
              <button
                onClick={() => marcarLido(alerta.id)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Marcar lido
              </button>
            </article>
          ))}
        </section>
      )}

      {lidos.length > 0 && (
        <section aria-label="Alertas anteriores">
          <h2 className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-3">
            Anteriores
          </h2>
          <div className="space-y-2">
            {lidos.map(alerta => (
              <article
                key={alerta.id}
                className="border border-white/5 rounded-xl p-3 opacity-35"
              >
                <p className="text-xs font-medium">
                  {TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
                </p>
                <p className="text-xs opacity-70 mt-0.5">
                  {alerta.mensagem}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
