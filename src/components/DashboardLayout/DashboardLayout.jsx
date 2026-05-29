import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'
import { useVitalsWeather } from '../../hooks/useVitalsWeather'
import { useTheme } from '../../context/ThemeContext'

const SIDEBAR_W = '244px'   // 256px sidebar - 12px margin

const WEATHER_THEMES = {
  excellent: {
    bg: 'radial-gradient(ellipse at 20% 50%, rgba(55,195,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(55,195,255,0.10) 0%, transparent 50%), linear-gradient(135deg, #EEF3FD 0%, #E0F4FF 100%)',
    bgDark: 'radial-gradient(ellipse at 20% 50%, rgba(55,195,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(55,195,255,0.08) 0%, transparent 50%), linear-gradient(135deg, #050C1B 0%, #061525 100%)',
    accent: '#37C3FF',
  },
  good: {
    bg: 'radial-gradient(ellipse at 30% 60%, rgba(45,215,95,0.15) 0%, transparent 60%), linear-gradient(135deg, #EEF3FD 0%, #E0FFE8 100%)',
    bgDark: 'radial-gradient(ellipse at 30% 60%, rgba(45,215,95,0.10) 0%, transparent 60%), linear-gradient(135deg, #050C1B 0%, #051510 100%)',
    accent: '#2DD75F',
  },
  warning: {
    bg: 'radial-gradient(ellipse at 50% 40%, rgba(255,160,35,0.15) 0%, transparent 60%), linear-gradient(135deg, #EEF3FD 0%, #FFF5E0 100%)',
    bgDark: 'radial-gradient(ellipse at 50% 40%, rgba(255,160,35,0.10) 0%, transparent 60%), linear-gradient(135deg, #050C1B 0%, #150F05 100%)',
    accent: '#FFA023',
  },
  critical: {
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(255,58,58,0.12) 0%, transparent 60%), linear-gradient(135deg, #EEF3FD 0%, #FFE0E0 100%)',
    bgDark: 'radial-gradient(ellipse at 50% 50%, rgba(255,58,58,0.08) 0%, transparent 60%), linear-gradient(135deg, #050C1B 0%, #150505 100%)',
    accent: '#FF3A3A',
  },
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { estado } = useVitalsWeather()
  const { tema } = useTheme()

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={{
        background: tema === 'dark' ? WEATHER_THEMES[estado]?.bgDark : WEATHER_THEMES[estado]?.bg,
        '--accent': WEATHER_THEMES[estado]?.accent,
      }}
    >
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Botão menu mobile */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-card dark:bg-d-card border border-border dark:border-d-border rounded-xl p-2 shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Conteúdo principal */}
      <main
        className="min-h-screen px-5 py-8 transition-all"
        style={{ paddingLeft: `calc(${SIDEBAR_W} + 28px + 20px)` }}
      >
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
