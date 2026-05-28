import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'

const SIDEBAR_W = '244px'   // 256px sidebar - 12px margin

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
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
