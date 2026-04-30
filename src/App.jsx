import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ThemeProvider }      from './context/ThemeContext'
import { ConnectionProvider, useConnection } from './context/ConnectionContext'
import ConnectionGate from './components/ConnectionGate/ConnectionGate'

import DashboardLayout  from './components/DashboardLayout/DashboardLayout'
import OnboardingPage   from './pages/OnboardingPage/OnboardingPage'
import DashboardPage    from './pages/DashboardPage/DashboardPage'
import MissoesPage      from './pages/MissoesPage/MissoesPage'
import CatalogoPage     from './pages/CatalogoPage/CatalogoPage'
import PerfilPage       from './pages/PerfilPage/PerfilPage'
import PrivacidadePage  from './pages/PrivacidadePage/PrivacidadePage'

function AppContent({ usuario, setUsuario }) {
  const { isConnected } = useConnection()

  const hoje = new Date().toDateString()
  if (usuario.ultimaData !== hoje) {
    setUsuario({ ...usuario, missoes_concluidas: [], ultimaData: hoje })
    return null
  }

  return (
    <>
      {!isConnected && <ConnectionGate />}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<DashboardLayout usuario={usuario} setUsuario={setUsuario} />}
          >
            <Route index              element={<DashboardPage  usuario={usuario} setUsuario={setUsuario} />} />
            <Route path="missoes"     element={<MissoesPage    usuario={usuario} setUsuario={setUsuario} />} />
            <Route path="catalogo"    element={<CatalogoPage   usuario={usuario} setUsuario={setUsuario} />} />
            <Route path="perfil"      element={<PerfilPage     usuario={usuario} />} />
            <Route path="privacidade" element={<PrivacidadePage usuario={usuario} setUsuario={setUsuario} />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default function App() {
  const [usuario, setUsuario] = useLocalStorage('careplus_usuario', null)

  if (!usuario) {
    return (
      <ThemeProvider>
        <OnboardingPage onCadastro={setUsuario} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <ConnectionProvider>
        <AppContent usuario={usuario} setUsuario={setUsuario} />
      </ConnectionProvider>
    </ThemeProvider>
  )
}
