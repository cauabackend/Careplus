/**
 * AuthContext — gerencia autenticação JWT.
 * Access token: memória (variável de módulo) + localStorage como fallback.
 * Refresh token: localStorage.
 * Usuário: localStorage (para persistir entre reloads).
 */
import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_usuario')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  /** Login: autentica, salva tokens e carrega perfil. */
  const login = useCallback(async (username, password) => {
    const tokens = await api.login({ username, password })
    localStorage.setItem('cp_access',  tokens.access)
    localStorage.setItem('cp_refresh', tokens.refresh)

    const perfil = await api.getUsuario()
    setUsuario(perfil)
    localStorage.setItem('cp_usuario', JSON.stringify(perfil))
    return perfil
  }, [])

  /** Logout: limpa tokens e estado. */
  const logout = useCallback(() => {
    localStorage.removeItem('cp_access')
    localStorage.removeItem('cp_refresh')
    localStorage.removeItem('cp_usuario')
    localStorage.removeItem('cp_uid')   // encerra a sessão da API local
    setUsuario(null)
  }, [])

  /** Atualiza o cache local do usuário (pontos, streak, etc). */
  const refreshUsuario = useCallback(async () => {
    try {
      const perfil = await api.getUsuario()
      setUsuario(perfil)
      localStorage.setItem('cp_usuario', JSON.stringify(perfil))
    } catch {
      // token expirado — desloga
      logout()
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      refreshUsuario,
      isAuthenticated: !!usuario,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
