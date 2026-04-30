import { NavLink } from 'react-router-dom'
import {
  Home, Target, Gift, User, Shield,
  LogOut, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

/*
 * NAV_LINKS — array de objetos com os dados de cada item de navegação.
 * Icone é um componente React do lucide-react (uppercase = convenção React).
 * Assim, o JSX abaixo pode chamar <Icone /> dinamicamente.
 */
const NAV_LINKS = [
  { to: '/',            label: 'Início',      Icone: Home,   end: true  },
  { to: '/missoes',     label: 'Missões',     Icone: Target, end: false },
  { to: '/catalogo',    label: 'Catálogo',    Icone: Gift,   end: false },
  { to: '/perfil',      label: 'Perfil',      Icone: User,   end: false },
  { to: '/privacidade', label: 'Privacidade', Icone: Shield, end: false },
]

/*
 * Sidebar — barra lateral flutuante com glassmorphism.
 *
 * Props:
 *   usuario → { nome, pontos }
 *   onSair  → callback para deslogar
 *
 * O tema (claro/escuro) vem do ThemeContext, sem precisar de props extras.
 */
export default function Sidebar({ usuario, onSair }) {
  const { nome, pontos } = usuario
  const { tema, alternarTema } = useTheme()  // lê o contexto de tema
  const escuro = tema === 'dark'

  return (
    <aside className="cp-sidebar">
      {/* ── Logo ── */}
      <div className="cp-sidebar__logo">
        <span className="cp-sidebar__logo-text">
          Care<em>Plus+</em>
        </span>
      </div>

      {/* ── Navegação ── */}
      <nav className="cp-sidebar__nav">
        {NAV_LINKS.map(({ to, label, Icone, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `cp-nav-link${isActive ? ' active' : ''}`}
          >
            {/*
             * strokeWidth={1.75} → traço fino, estilo "linha fina" pedido no design.
             * Icons do lucide aceitam size e strokeWidth como props.
             */}
            <Icone size={17} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="cp-sidebar__footer">
        {/* Alternador de tema — lê/escreve via Context API */}
        <button
          className="cp-theme-toggle"
          onClick={alternarTema}
          aria-label="Alternar tema"
        >
          {escuro
            ? <Sun  size={15} strokeWidth={2} />
            : <Moon size={15} strokeWidth={2} />
          }
          <span>{escuro ? 'Tema claro' : 'Tema escuro'}</span>
        </button>

        {/* User card com botão de logout */}
        <div className="cp-user-card">
          <div className="cp-user-card__avatar">
            {nome.charAt(0).toUpperCase()}
          </div>
          <div className="cp-user-card__info">
            <span className="cp-user-card__name">{nome}</span>
            <span className="cp-user-card__pts">{pontos} pts</span>
          </div>
          <button
            className="cp-user-card__logout"
            onClick={onSair}
            title="Sair da conta"
            aria-label="Sair"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  )
}
