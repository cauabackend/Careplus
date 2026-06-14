// src/components/BottomNav/BottomNav.jsx
// Navegação principal do app — barra inferior fixa (mobile-first), usando o
// efeito expandable-tabs do 21st.dev. A aba da rota atual aparece expandida
// com o rótulo; tocar numa aba navega. Substitui o FloatingNav.
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Target, BookOpen, Link2 } from 'lucide-react'
import { ExpandableTabs } from '../ui/expandable-tabs'

// 4 abas (padrão de barra inferior em app). Perfil saiu para o avatar do topo;
// Sentinel foi removida.
const ROUTES = [
  { path: '/',          title: 'Início',    icon: Home     },
  { path: '/missoes',   title: 'Missões',   icon: Target   },
  { path: '/chronicle', title: 'Crônica',   icon: BookOpen },
  { path: '/chains',    title: 'Correntes', icon: Link2    },
]

export default function BottomNav() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  // Índice da rota ativa. Match exato para "/"; para o resto, exato OU prefixo
  // com fronteira de segmento ("/chains" casa "/chains" e "/chains/x", nunca "/chainsX").
  const selected = ROUTES.findIndex(r =>
    r.path === '/'
      ? pathname === '/'
      : pathname === r.path || pathname.startsWith(r.path + '/')
  )

  function handleChange(index) {
    if (index == null || index === selected) return
    navigate(ROUTES[index].path)
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed left-0 right-0 z-40 flex justify-center px-3 pointer-events-none"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
      }}
    >
      <div className="pointer-events-auto">
        <ExpandableTabs
          tabs={ROUTES}
          selected={selected === -1 ? null : selected}
          onChange={handleChange}
          style={{ flexWrap: 'nowrap', boxShadow: '0 10px 40px rgba(0,0,10,0.5)' }}
        />
      </div>
    </nav>
  )
}
