import { NavLink } from 'react-router-dom'
import { Home, CheckCircle, BookOpen, ShieldAlert, Link2, User, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth }  from '../../context/AuthContext'

const LINKS = [
  { to: '/',          label: 'Dashboard',     Icon: Home,        end: true },
  { to: '/missoes',   label: 'Missões',       Icon: CheckCircle, end: false },
  { to: '/chronicle', label: 'Chronicle',     Icon: BookOpen,    end: false },
  { to: '/sentinel',  label: 'SENTINEL',      Icon: ShieldAlert, end: false },
  { to: '/chains',    label: 'Health Chains', Icon: Link2,       end: false },
  { to: '/perfil',    label: 'Perfil',        Icon: User,        end: false },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { tema, alternarTema } = useTheme()
  const { usuario, logout }    = useAuth()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-cp-teal/15 text-cp-teal'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-3 left-3 bottom-3 z-40
          w-56 rounded-2xl
          bg-[rgba(7,15,35,0.91)] border border-white/7
          backdrop-blur-xl
          flex flex-col
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+12px)]'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-white/7">
          <span className="font-sora text-base font-extrabold text-white tracking-tight">
            Care<span className="text-cp-teal">Plus+</span>
          </span>
          {usuario && (
            <p className="text-xs text-white/40 mt-0.5 truncate">{usuario.first_name || usuario.username}</p>
          )}
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 sidebar-scroll overflow-y-auto" aria-label="Navegação principal">
          {LINKS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon size={16} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/7 pt-3">
          <button
            onClick={alternarTema}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {tema === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
