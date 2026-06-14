import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import DashboardLayout  from './components/DashboardLayout/DashboardLayout'
import LoginPage        from './pages/LoginPage/LoginPage'
import RegisterPage     from './pages/RegisterPage/RegisterPage'
import DashboardPage    from './pages/DashboardPage/DashboardPage'
import MissoesPage      from './pages/MissoesPage/MissoesPage'
import PerfilPage       from './pages/PerfilPage/PerfilPage'
import PrivacidadePage  from './pages/PrivacidadePage/PrivacidadePage'
import ChroniclePage    from './pages/ChroniclePage/ChroniclePage'
import PreviewPage      from './pages/PreviewPage/PreviewPage'
import HealthChainsPage from './pages/HealthChainsPage/HealthChainsPage'
import ImmersionLab     from './pages/ImmersionLab/ImmersionLab'

// Lazy: isola o runtime WASM do Rive do bundle principal
const RivePreviewPage = lazy(() => import('./pages/RivePreviewPage/RivePreviewPage'))

function AuthGate() {
  const [tela, setTela] = useState('login')
  if (tela === 'login')
    return <LoginPage    onSwitchToRegister={() => setTela('register')} />
  return       <RegisterPage onSwitchToLogin={()    => setTela('login')}    />
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Vitrine de imersão (framer-motion) — pública para demo sem backend */}
        <Route path="/lab" element={<ImmersionLab />} />

        {isAuthenticated ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index              element={<DashboardPage    />} />
            <Route path="missoes"     element={<MissoesPage      />} />
            <Route path="chronicle"   element={<ChroniclePage    />} />
            <Route path="chains"      element={<HealthChainsPage />} />
            <Route path="perfil"      element={<PerfilPage       />} />
            <Route path="privacidade" element={<PrivacidadePage  />} />
            <Route path="preview"     element={<PreviewPage      />} />
            <Route path="rive-preview" element={
              <Suspense fallback={null}><RivePreviewPage /></Suspense>
            } />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<AuthGate />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
