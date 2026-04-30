import { createContext, useContext, useState } from 'react'

const ConnectionContext = createContext(null)

export function ConnectionProvider({ children }) {
  const [isConnected, setIsConnected] = useState(
    () => localStorage.getItem('cp_connected') === 'true'
  )

  function conectar() {
    localStorage.setItem('cp_connected', 'true')
    setIsConnected(true)
  }

  return (
    <ConnectionContext.Provider value={{ isConnected, conectar }}>
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  return useContext(ConnectionContext)
}
