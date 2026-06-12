// src/components/DashboardLayout/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
import FloatingNav from '../FloatingNav/FloatingNav'
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

  return (
    <div
      className={`app-bg vw-${estado}`}
      style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}
    >
      {/* Atmosfera */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
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

      {/* Nav flutuante */}
      <FloatingNav />

      {/* Conteúdo */}
      <main
        style={{
          position:  'relative',
          zIndex:    1,
          minHeight: '100dvh',
          padding:   'clamp(24px, 5vw, 56px) clamp(16px, 5vw, 48px)',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Outlet />
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
