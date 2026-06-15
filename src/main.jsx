import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider }  from './context/AuthContext'
import { iniciarMqtt }   from './services/mqttClient'
import App from './App'
import './index.css'

// Inicia a conexão MQTT (modo Edge B) no load — sem efeito se não configurada.
iniciarMqtt()

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
)
