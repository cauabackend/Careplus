// src/components/DashboardLayout/DashboardLayout.jsx
import { cloneElement, useState } from 'react'
import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomNav from '../BottomNav/BottomNav'
import ProfileButton from '../ProfileButton/ProfileButton'
import Onboarding from '../Onboarding/Onboarding'
import { VitalsWeatherProvider, useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

// Partículas atmosféricas — posições e delays fixos
const PARTICLES = [
  { id: 0,  left: '8%',  delay: '0s',    dur: '14s' },
  { id: 1,  left: '18%', delay: '2.1s',  dur: '11s' },
  { id: 2,  left: '29%', delay: '4.5s',  dur: '16s' },
  { id: 3,  left: '41%', delay: '1.3s',  dur: '13s' },
  { id: 4,  left: '53%', delay: '6.2s',  dur: '15s' },
  { id: 5,  left: '64%', delay: '3.7s',  dur: '12s' },
  { id: 6,  left: '75%', delay: '0.8s',  dur: '17s' },
  { id: 7,  left: '87%', delay: '5.0s',  dur: '10s' },
  { id: 8,  left: '13%', delay: '7.4s',  dur: '14s' },
  { id: 9,  left: '46%', delay: '9.1s',  dur: '11s' },
  { id: 10, left: '60%', delay: '2.8s',  dur: '16s' },
  { id: 11, left: '82%', delay: '8.3s',  dur: '13s' },
]

function Shell() {
  const { estado } = useVitalsWeatherCtx()
  const outlet     = useOutlet()
  const location   = useLocation()
  const [onboarding, setOnboarding] = useState(() => !localStorage.getItem('cp_onboarded'))

  function fecharOnboarding() {
    localStorage.setItem('cp_onboarded', '1')
    setOnboarding(false)
  }

  return (
    <div
      className={`app-bg vw-${estado} relative min-h-[100dvh] overflow-hidden`}
    >
      {onboarding && <Onboarding onComplete={fecharOnboarding} />}

      {/* Atmosfera */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
      >
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{ left: p.left, bottom: '0', '--delay': p.delay, '--dur': p.dur }}
          />
        ))}
        <div className="aurora-band b1" />
        <div className="aurora-band b2" />
        <div className="aurora-band b3" />
      </div>

      {/* Atalho de perfil (avatar, topo-direito) + navegação principal (barra inferior) */}
      <ProfileButton />
      <BottomNav />

      {/* Conteúdo (padding-bottom extra reserva espaço para a barra inferior) */}
      <main
        className="relative z-[1] min-h-[100dvh] py-[clamp(24px,5vw,56px)] px-[clamp(16px,5vw,48px)]"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        }}
      >
        <div className="max-w-[720px] mx-auto">
          {/* AnimatePresence + key por rota → o exit do PageTransition dispara
              ao trocar de página (transição contínua entre telas). */}
          <AnimatePresence mode="wait" initial={false}>
            {outlet && cloneElement(outlet, { key: location.pathname })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <VitalsWeatherProvider>
      <Shell />
    </VitalsWeatherProvider>
  )
}
