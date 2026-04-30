import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'

/*
 * DashboardLayout — esqueleto com sidebar flutuante + área de conteúdo
 *
 * O tema agora vem do ThemeContext (sem props tema/setTema aqui).
 * Sidebar consome o contexto diretamente via useTheme().
 */
export default function DashboardLayout({ usuario, setUsuario }) {
  function sair() {
    localStorage.removeItem('careplus_usuario')
    setUsuario(null)
  }

  return (
    <div>
      <Sidebar usuario={usuario} onSair={sair} />
      <main className="cp-main">
        <Outlet />
      </main>
    </div>
  )
}
