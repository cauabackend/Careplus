// src/context/VitalsWeatherContext.jsx
// Estado de saúde calculado UMA vez e compartilhado com toda a app.
// Sem esse contexto, cada página chama useVitalsWeather() separadamente
// e recebe respostas em tempos diferentes → visual descoordenado.
import { createContext, useContext } from 'react'
import { useVitalsWeather } from '../hooks/useVitalsWeather'

const VitalsWeatherCtx = createContext({ estado: 'good', score: 0, loading: true })

export function VitalsWeatherProvider({ children }) {
  const value = useVitalsWeather()
  return <VitalsWeatherCtx.Provider value={value}>{children}</VitalsWeatherCtx.Provider>
}

export function useVitalsWeatherCtx() {
  return useContext(VitalsWeatherCtx)
}
