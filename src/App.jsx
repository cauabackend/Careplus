import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import DashboardLayout  from './components/DashboardLayout/DashboardLayout'
import LoginPage        from './pages/LoginPage/LoginPage'
import RegisterPage     from './pages/RegisterPage/RegisterPage'
import DashboardPage    from './pages/DashboardPage/DashboardPage'
import MissoesPage      from './pages/MissoesPage/MissoesPage'
import PerfilPage       from './pages/PerfilPage/PerfilPage'
import PrivacidadePage  from './pages/PrivacidadePage/PrivacidadePage'

// Páginas de gamificação (criadas no Plano 3)
import ChroniclePage    from './pages/ChroniclePage/ChroniclePage'
import SentinelPage     from './pages/SentinelPage/SentinelPage'
import HealthChainsPage from './pages/HealthChainsPage/HealthChainsPage'

function AuthGate() {
  const [tela, setTela] = useState('login')   // 'login' | 'register'
  if (tela === 'login')
    return <LoginPage    onSwitchToRegister={() => setTela('register')} />
  return       <RegisterPage onSwitchToLogin={()    => setTela('login')}    />
}

export default function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <AuthGate />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index              element={<DashboardPage    />} />
          <Route path="missoes"     element={<MissoesPage      />} />
          <Route path="chronicle"   element={<ChroniclePage    />} />
          <Route path="sentinel"    element={<SentinelPage     />} />
          <Route path="chains"      element={<HealthChainsPage />} />
          <Route path="perfil"      element={<PerfilPage       />} />
          <Route path="privacidade" element={<PrivacidadePage  />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
