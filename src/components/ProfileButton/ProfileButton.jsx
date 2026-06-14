// src/components/ProfileButton/ProfileButton.jsx
// Avatar fixo no topo-direito — atalho para o Perfil (substitui a aba na barra).
// Some quando você já está em /perfil. 44px = alvo de toque mínimo.
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

export default function ProfileButton() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { usuario }  = useAuth()

  if (!usuario || pathname === '/perfil') return null

  const nome    = usuario.first_name || usuario.username || '?'
  const inicial = nome.charAt(0).toUpperCase()

  return (
    <button
      onClick={() => navigate('/perfil')}
      aria-label="Abrir perfil"
      className="fixed z-40 right-4 p-0 border-none bg-transparent cursor-pointer rounded-full"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      }}
    >
      <Avatar
        className="h-11 w-11 border border-[var(--card-border)]"
        style={{ boxShadow: '0 6px 20px rgba(0,0,10,0.4)' }}
      >
        {usuario.avatar_url && <AvatarImage src={usuario.avatar_url} alt="" />}
        <AvatarFallback className="text-base">{inicial}</AvatarFallback>
      </Avatar>
    </button>
  )
}
