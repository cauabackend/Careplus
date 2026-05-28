# CarePlus+ V2 — Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o frontend React existente para Tailwind CSS, adicionar autenticação JWT, criar camada de API centralizada e conectar todas as páginas ao backend Django.

**Architecture:** React + Vite mantido. Tailwind CSS substitui index.css customizado. AuthContext gerencia tokens JWT. `api.js` centraliza todos os fetches. Páginas existentes são migradas; LoginPage e RegisterPage substituem OnboardingPage. Sidebar recebe nova navegação com as 4 features.

**Tech Stack:** React 18, Vite, Tailwind CSS 3, lucide-react (já instalado), react-router-dom (já instalado)

**Pré-requisito:** Backend (Plano 1) rodando em `localhost:8000`

---

## File Map

```
frontend/
├── tailwind.config.js              ← CRIAR: tokens de design
├── postcss.config.js               ← CRIAR: gerado pelo tailwind init
├── src/
│   ├── index.css                   ← MODIFICAR: só Tailwind directives + reset mínimo
│   ├── services/
│   │   └── api.js                  ← CRIAR: camada fetch centralizada
│   ├── context/
│   │   ├── AuthContext.jsx         ← CRIAR: substitui localStorage de usuário
│   │   └── ThemeContext.jsx        ← MANTER: só remove referências a CSS vars customizados
│   ├── main.jsx                    ← MODIFICAR: adiciona AuthProvider
│   ├── App.jsx                     ← MODIFICAR: rotas + auth guard
│   ├── pages/
│   │   ├── LoginPage/
│   │   │   └── LoginPage.jsx       ← CRIAR
│   │   ├── RegisterPage/
│   │   │   └── RegisterPage.jsx    ← CRIAR
│   │   ├── DashboardPage/
│   │   │   └── DashboardPage.jsx   ← MODIFICAR: Tailwind + API
│   │   ├── MissoesPage/
│   │   │   └── MissoesPage.jsx     ← MODIFICAR: Tailwind + API
│   │   ├── PerfilPage/
│   │   │   └── PerfilPage.jsx      ← MODIFICAR: Tailwind
│   │   └── PrivacidadePage/
│   │       └── PrivacidadePage.jsx ← MODIFICAR: Tailwind
│   └── components/
│       ├── DashboardLayout/
│       │   └── DashboardLayout.jsx ← MODIFICAR: Tailwind
│       ├── Sidebar/
│       │   └── Sidebar.jsx         ← MODIFICAR: nova nav + Tailwind
│       ├── StatCard/
│       │   └── StatCard.jsx        ← MODIFICAR: Tailwind
│       ├── MissionCard/
│       │   └── MissionCard.jsx     ← MODIFICAR: Tailwind
│       └── BadgeCard/
│           └── BadgeCard.jsx       ← MODIFICAR: Tailwind
```

**Arquivos removidos:**
- `src/pages/OnboardingPage/` (substituído por Login + Register)
- `src/pages/CatalogoPage/` (feature removida)
- `src/components/ConnectionGate/` (substituído por auth JWT)
- `src/context/ConnectionContext.jsx` (substituído por AuthContext)
- `src/hooks/useLocalStorage.js` (não usado mais)

---

## Task 1: Instalar e configurar Tailwind CSS

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Modify: `frontend/src/index.css`

- [ ] **Passo 1: Instalar Tailwind**

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Saída esperada: criação de `tailwind.config.js` e `postcss.config.js`

- [ ] **Passo 2: Configurar tailwind.config.js com tokens do design**

Conteúdo completo de `frontend/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // Dark mode via atributo data-theme="dark" no <html>
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'cp-teal':    '#00BFDF',
        'cp-teal-lt': '#E6F9FC',
        'cp-navy':    '#0B2454',
        'cp-navy-2':  '#1A3E7A',
        'cp-orange':  '#F97316',
        'cp-success': '#10B981',
        'cp-gold':    '#F59E0B',
        // Surfaces (modo claro)
        'bg':         '#EEF3FD',
        'card':       '#FFFFFF',
        'border':     '#DDE7F5',
        'text':       '#0B1222',
        'muted':      '#617390',
        // Surfaces (modo escuro) — prefixadas com d-
        'd-bg':       '#050C1B',
        'd-card':     '#0D1628',
        'd-border':   '#182338',
        'd-text':     '#E2ECF8',
        'd-muted':    '#6B88B8',
      },
      fontFamily: {
        sora:   ['Sora', 'system-ui', 'sans-serif'],
        dm:     ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Passo 3: Substituir index.css**

Conteúdo completo de `frontend/src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }

  body {
    @apply font-dm bg-bg dark:bg-d-bg text-text dark:text-d-text min-h-screen;
    background-image:
      radial-gradient(ellipse 65% 55% at 85% -5%, rgba(0,191,223,0.07) 0%, transparent 100%),
      radial-gradient(ellipse 45% 65% at 15% 105%, rgba(11,36,84,0.05) 0%, transparent 100%);
    background-attachment: fixed;
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.35s, color 0.35s;
  }

  h1, h2, h3, h4, h5, h6 { @apply font-sora; }
}

@layer components {
  /* Sidebar scrollbar */
  .sidebar-scroll::-webkit-scrollbar { width: 4px; }
  .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
  .sidebar-scroll::-webkit-scrollbar-thumb { @apply bg-white/10 rounded-full; }
}
```

- [ ] **Passo 4: Verificar que Vite compila sem erros**

```bash
npm run dev
```

Abrir `http://localhost:5173` — a página deve carregar (pode estar sem estilo por ora). Sem erros no terminal.

- [ ] **Passo 5: Commit**

```bash
git add frontend/tailwind.config.js frontend/postcss.config.js frontend/src/index.css
git commit -m "feat: install Tailwind CSS with design tokens"
```

---

## Task 2: Camada de API centralizada (api.js)

**Files:**
- Create: `frontend/src/services/api.js`

- [ ] **Passo 1: Criar api.js**

Conteúdo completo de `frontend/src/services/api.js`:
```js
/**
 * CarePlus+ V2 — Camada de API centralizada.
 * Todos os fetches do app passam por aqui.
 * Base URL: http://localhost:8000/api
 */

const BASE = 'http://localhost:8000/api'

/** Lê o access token do localStorage. */
function getToken() {
  return localStorage.getItem('cp_access')
}

/**
 * Faz uma requisição HTTP autenticada.
 * Lança erro com { status, data } se a resposta não for 2xx.
 */
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.detail || data.erro || 'Erro na requisição')
    err.status = res.status
    err.data   = data
    throw err
  }

  return data
}

const get  = (path)       => request('GET',    path)
const post = (path, body) => request('POST',   path, body)
const put  = (path, body) => request('PUT',    path, body)
const del  = (path)       => request('DELETE', path)

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  login:           (data) => post('/auth/login/',    data),
  register:        (data) => post('/auth/register/', data),
  refreshToken:    (data) => post('/auth/refresh/',  data),

  // ── Usuário ────────────────────────────────────────────────
  getUsuario:      ()     => get('/usuario/'),
  updateUsuario:   (data) => put('/usuario/', data),

  // ── Progresso ──────────────────────────────────────────────
  getProgresso:    ()     => get('/progresso/'),
  salvarProgresso: (data) => post('/progresso/', data),
  getHistorico:    ()     => get('/progresso/historico/'),

  // ── Missões ────────────────────────────────────────────────
  getMissoes:      ()     => get('/missoes/'),
  concluirMissao:  (data) => post('/missoes/', data),

  // ── Badges ────────────────────────────────────────────────
  getBadges:       ()     => get('/badges/'),

  // ── SENTINEL ──────────────────────────────────────────────
  getSentinel:     ()     => get('/sentinel/'),
  marcarAlertaLido:(id)   => put(`/sentinel/${id}/`, { lido: true }),

  // ── Chronicle ─────────────────────────────────────────────
  getChronicle:    ()     => get('/chronicle/'),

  // ── Health Chains ─────────────────────────────────────────
  getConexoes:     ()     => get('/chains/conexoes/'),
  criarConexao:    (data) => post('/chains/conexoes/', data),
  removerConexao:  (id)   => del(`/chains/conexoes/${id}/`),
  getEventos:      ()     => get('/chains/eventos/'),
  getImpacto:      ()     => get('/chains/impacto/'),
}
```

- [ ] **Passo 2: Commit**

```bash
git add frontend/src/services/api.js
git commit -m "feat: add centralized API service layer"
```

---

## Task 3: AuthContext e main.jsx

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`
- Modify: `frontend/src/main.jsx`

- [ ] **Passo 1: Criar AuthContext.jsx**

Conteúdo completo de `frontend/src/context/AuthContext.jsx`:
```jsx
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
```

- [ ] **Passo 2: Atualizar main.jsx**

Conteúdo completo de `frontend/src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider }  from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/context/AuthContext.jsx frontend/src/main.jsx
git commit -m "feat: add AuthContext with JWT token management"
```

---

## Task 4: LoginPage e RegisterPage

**Files:**
- Create: `frontend/src/pages/LoginPage/LoginPage.jsx`
- Create: `frontend/src/pages/RegisterPage/RegisterPage.jsx`

- [ ] **Passo 1: Criar LoginPage.jsx**

Conteúdo completo de `frontend/src/pages/LoginPage/LoginPage.jsx`:
```jsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [erro, setErro]       = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      await login(form.username, form.password)
    } catch (err) {
      setErro('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg dark:bg-d-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-muted dark:text-d-muted mb-1">
            CarePlus+
          </div>
          <h1 className="font-sora text-3xl font-extrabold text-text dark:text-d-text">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-muted dark:text-d-muted mt-1">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-6 space-y-4">
          {erro && (
            <div role="alert" className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {erro}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-muted dark:text-d-muted mb-1 uppercase tracking-wide">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-border dark:border-d-border bg-bg dark:bg-d-bg text-text dark:text-d-text px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cp-teal transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-muted dark:text-d-muted mb-1 uppercase tracking-wide">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-border dark:border-d-border bg-bg dark:bg-d-bg text-text dark:text-d-text px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cp-teal transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cp-teal hover:bg-[#00a8c4] disabled:opacity-60 text-white font-semibold rounded-full py-2.5 text-sm transition-colors"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-muted dark:text-d-muted mt-4">
          Não tem conta?{' '}
          <button onClick={onSwitchToRegister} className="text-cp-teal font-semibold hover:underline">
            Criar conta
          </button>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Passo 2: Criar RegisterPage.jsx**

Conteúdo completo de `frontend/src/pages/RegisterPage/RegisterPage.jsx`:
```jsx
import { useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage({ onSwitchToLogin }) {
  const { login } = useAuth()
  const [form, setForm]       = useState({ first_name: '', username: '', email: '', password: '' })
  const [erro, setErro]       = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      await api.register(form)
      await login(form.username, form.password)
    } catch (err) {
      const msg = err.data?.email?.[0] || err.data?.username?.[0] || 'Erro ao criar conta.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-border dark:border-d-border bg-bg dark:bg-d-bg text-text dark:text-d-text px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cp-teal transition'
  const labelClass = 'block text-xs font-semibold text-muted dark:text-d-muted mb-1 uppercase tracking-wide'

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg dark:bg-d-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-muted dark:text-d-muted mb-1">
            CarePlus+
          </div>
          <h1 className="font-sora text-3xl font-extrabold text-text dark:text-d-text">
            Criar conta
          </h1>
          <p className="text-sm text-muted dark:text-d-muted mt-1">
            Comece sua jornada de saúde hoje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-6 space-y-4">
          {erro && (
            <div role="alert" className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {erro}
            </div>
          )}

          <div>
            <label htmlFor="first_name" className={labelClass}>Nome</label>
            <input id="first_name" name="first_name" type="text" required value={form.first_name} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="username" className={labelClass}>Usuário</label>
            <input id="username" name="username" type="text" required autoComplete="username" value={form.username} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>E-mail</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Senha (mín. 6 caracteres)</label>
            <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={handleChange} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cp-teal hover:bg-[#00a8c4] disabled:opacity-60 text-white font-semibold rounded-full py-2.5 text-sm transition-colors"
          >
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-muted dark:text-d-muted mt-4">
          Já tem conta?{' '}
          <button onClick={onSwitchToLogin} className="text-cp-teal font-semibold hover:underline">
            Entrar
          </button>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/pages/LoginPage/ frontend/src/pages/RegisterPage/
git commit -m "feat: add LoginPage and RegisterPage with Tailwind"
```

---

## Task 5: App.jsx — rotas + auth guard

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Passo 1: Reescrever App.jsx**

Conteúdo completo de `frontend/src/App.jsx`:
```jsx
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
```

- [ ] **Passo 2: Criar stubs para páginas novas (evitar erro de import)**

```bash
mkdir -p frontend/src/pages/ChroniclePage
mkdir -p frontend/src/pages/SentinelPage
mkdir -p frontend/src/pages/HealthChainsPage
```

Criar `frontend/src/pages/ChroniclePage/ChroniclePage.jsx`:
```jsx
export default function ChroniclePage() {
  return <main className="p-6"><h1 className="font-sora text-2xl font-bold">The Chronicle</h1><p className="text-muted mt-2">Em breve…</p></main>
}
```

Criar `frontend/src/pages/SentinelPage/SentinelPage.jsx`:
```jsx
export default function SentinelPage() {
  return <main className="p-6"><h1 className="font-sora text-2xl font-bold">SENTINEL</h1><p className="text-muted mt-2">Em breve…</p></main>
}
```

Criar `frontend/src/pages/HealthChainsPage/HealthChainsPage.jsx`:
```jsx
export default function HealthChainsPage() {
  return <main className="p-6"><h1 className="font-sora text-2xl font-bold">Health Chains</h1><p className="text-muted mt-2">Em breve…</p></main>
}
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/App.jsx frontend/src/pages/ChroniclePage/ frontend/src/pages/SentinelPage/ frontend/src/pages/HealthChainsPage/
git commit -m "feat: update App.jsx with auth guard and new routes"
```

---

## Task 6: Sidebar — nova navegação + Tailwind

**Files:**
- Modify: `frontend/src/components/Sidebar/Sidebar.jsx`

- [ ] **Passo 1: Reescrever Sidebar.jsx**

Conteúdo completo de `frontend/src/components/Sidebar/Sidebar.jsx`:
```jsx
import { NavLink } from 'react-router-dom'
import { Home, CheckCircle, BookOpen, ShieldAlert, Link2, User, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth }  from '../../context/AuthContext'

const LINKS = [
  { to: '/',          label: 'Dashboard',     Icon: Home,        end: true },
  { to: '/missoes',   label: 'Missões',       Icon: CheckCircle, end: false },
  { to: '/chronicle', label: 'Chronicle',     Icon: BookOpen,    end: false },
  { to: '/sentinel',  label: 'SENTINEL',      Icon: ShieldAlert, end: false },
  { to: '/chains',    label: 'Health Chains', Icon: Link2,       end: false },
  { to: '/perfil',    label: 'Perfil',        Icon: User,        end: false },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { theme, toggleTheme } = useTheme()
  const { usuario, logout }    = useAuth()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-cp-teal/15 text-cp-teal'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-3 left-3 bottom-3 z-40
          w-56 rounded-2xl
          bg-[rgba(7,15,35,0.91)] border border-white/7
          backdrop-blur-xl
          flex flex-col
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+12px)]'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-white/7">
          <span className="font-sora text-base font-extrabold text-white tracking-tight">
            Care<span className="text-cp-teal">Plus+</span>
          </span>
          {usuario && (
            <p className="text-xs text-white/40 mt-0.5 truncate">{usuario.first_name || usuario.username}</p>
          )}
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 sidebar-scroll overflow-y-auto" aria-label="Navegação principal">
          {LINKS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon size={16} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/7 pt-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
```

- [ ] **Passo 2: Commit**

```bash
git add frontend/src/components/Sidebar/Sidebar.jsx
git commit -m "feat: migrate Sidebar to Tailwind with new navigation and logout"
```

---

## Task 7: DashboardLayout + componentes base

**Files:**
- Modify: `frontend/src/components/DashboardLayout/DashboardLayout.jsx`
- Modify: `frontend/src/components/StatCard/StatCard.jsx`
- Modify: `frontend/src/components/MissionCard/MissionCard.jsx`

- [ ] **Passo 1: Reescrever DashboardLayout.jsx**

Conteúdo completo de `frontend/src/components/DashboardLayout/DashboardLayout.jsx`:
```jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'

const SIDEBAR_W = '244px'   // 256px sidebar - 12px margin

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Botão menu mobile */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-card dark:bg-d-card border border-border dark:border-d-border rounded-xl p-2 shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Conteúdo principal */}
      <main
        className="min-h-screen px-5 py-8 transition-all"
        style={{ paddingLeft: `calc(${SIDEBAR_W} + 28px + 20px)` }}
      >
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Passo 2: Reescrever StatCard.jsx**

Conteúdo completo de `frontend/src/components/StatCard/StatCard.jsx`:
```jsx
export default function StatCard({ label, valor, Icone, cor = '#00BFDF', invertido = false }) {
  return (
    <article
      className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
        invertido
          ? 'bg-cp-navy dark:bg-cp-navy border-cp-navy-2'
          : 'bg-card dark:bg-d-card border-border dark:border-d-border'
      }`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${cor}18` }}
      >
        <Icone size={18} strokeWidth={2} style={{ color: cor }} />
      </div>
      <div className="min-w-0">
        <div className={`text-[0.65rem] font-bold tracking-widest uppercase ${invertido ? 'text-white/50' : 'text-muted dark:text-d-muted'}`}>
          {label}
        </div>
        <div className={`font-sora text-xl font-extrabold leading-tight ${invertido ? 'text-white' : 'text-text dark:text-d-text'}`}>
          {valor}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Passo 3: Reescrever MissionCard.jsx**

Conteúdo completo de `frontend/src/components/MissionCard/MissionCard.jsx`:
```jsx
export default function MissionCard({ titulo, Icone, meta, atual, unidade, pontos, concluida, cor }) {
  const pct     = Math.min(Math.round((atual / meta) * 100), 100)
  const label   = unidade === 'L'      ? `${atual}L / ${meta}L`
                : unidade === 'horas'  ? `${atual}h / ${meta}h`
                : `${atual.toLocaleString('pt-BR')} / ${meta.toLocaleString('pt-BR')}`

  return (
    <article className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-4 flex flex-col gap-3 transition-colors">
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${cor}18` }}>
            <Icone size={15} strokeWidth={2} style={{ color: cor }} />
          </div>
          <span className="text-sm font-semibold text-text dark:text-d-text">{titulo}</span>
        </div>
        {concluida && (
          <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-cp-success/10 text-cp-success px-2 py-0.5 rounded-full">
            ✓ Feito
          </span>
        )}
      </header>

      {/* Barra de progresso */}
      <div>
        <div className="flex justify-between text-xs text-muted dark:text-d-muted mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-border dark:bg-d-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: cor }}
          />
        </div>
      </div>

      <footer className="text-[0.65rem] font-semibold text-muted dark:text-d-muted">
        +{pontos} pts ao completar
      </footer>
    </article>
  )
}
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: migrate DashboardLayout, StatCard, MissionCard to Tailwind"
```

---

## Task 8: DashboardPage + MissoesPage conectadas à API

**Files:**
- Modify: `frontend/src/pages/DashboardPage/DashboardPage.jsx`
- Modify: `frontend/src/pages/MissoesPage/MissoesPage.jsx`

- [ ] **Passo 1: Reescrever DashboardPage.jsx**

Conteúdo completo de `frontend/src/pages/DashboardPage/DashboardPage.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Award, CheckCircle2 } from 'lucide-react'
import { useAuth }     from '../../context/AuthContext'
import { api }         from '../../services/api'
import StatCard        from '../../components/StatCard/StatCard'
import MissionCard     from '../../components/MissionCard/MissionCard'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'

export default function DashboardPage() {
  const { usuario, refreshUsuario } = useAuth()
  const [progresso, setProgresso]   = useState(null)
  const [missoes,   setMissoes]     = useState([])

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    api.getProgresso().then(setProgresso).catch(() => {})
    api.getMissoes().then(setMissoes).catch(() => {})
    refreshUsuario()
  }, [refreshUsuario])

  if (!usuario) return null

  const dados           = progresso ?? { passos: 0, agua: 0, sono: 0 }
  const missoesConcluidas = missoes.map(m => m.chave_missao)

  return (
    <div>
      <header className="flex justify-between items-start mb-6 flex-wrap gap-2">
        <div>
          <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Início</div>
          <h1 className="font-sora text-2xl font-extrabold text-text dark:text-d-text mt-0.5">
            Olá, {usuario.first_name || usuario.username}
          </h1>
          <p className="text-sm text-muted dark:text-d-muted mt-0.5 capitalize">{hoje}</p>
        </div>
      </header>

      {/* Estatísticas */}
      <section aria-label="Estatísticas do usuário" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Pontos"         valor={usuario.pontos}                                         Icone={Star}         invertido />
        <StatCard label="Streak"         valor={`${usuario.streak}d`}                                   Icone={Zap}          cor="#F97316" />
        <StatCard label="Badges"         valor={usuario.badges_count ?? '—'}                            Icone={Award}        cor="#F59E0B" />
        <StatCard label="Missões"        valor={missoesConcluidas.length}                               Icone={CheckCircle2} cor="#10B981" />
      </section>

      {/* Missões do dia */}
      <section aria-labelledby="dash-missoes-title" className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Hoje</div>
            <h2 id="dash-missoes-title" className="font-sora text-base font-bold text-text dark:text-d-text mt-0.5">
              Missões do Dia
            </h2>
          </div>
          <Link
            to="/missoes"
            className="bg-cp-teal hover:bg-[#00a8c4] text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors"
          >
            Atualizar progresso
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade, cor }) => (
            <MissionCard
              key={chave}
              titulo={titulo}
              Icone={Icone}
              meta={METAS[chave]}
              atual={dados[chave] ?? 0}
              unidade={unidade}
              pontos={PONTOS_POR_MISSAO[chave]}
              concluida={missoesConcluidas.includes(chave)}
              cor={cor}
            />
          ))}
        </div>
      </section>

      {/* Banner SENTINEL */}
      <aside className="bg-cp-navy rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-white/40">SENTINEL</div>
            <h2 className="font-sora text-base font-bold text-white mt-0.5">
              Monitore seus padrões de saúde
            </h2>
            <p className="text-sm text-white/50 mt-0.5">Alertas inteligentes antes do problema aparecer</p>
          </div>
          <Link
            to="/sentinel"
            className="bg-cp-teal hover:bg-[#00a8c4] text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors"
          >
            Ver alertas
          </Link>
        </div>
      </aside>
    </div>
  )
}
```

- [ ] **Passo 2: Reescrever MissoesPage.jsx**

Conteúdo completo de `frontend/src/pages/MissoesPage/MissoesPage.jsx`:
```jsx
import { useState, useEffect } from 'react'
import { HeartPulse, RefreshCw } from 'lucide-react'
import { useAuth }    from '../../context/AuthContext'
import { api }        from '../../services/api'
import MissionCard    from '../../components/MissionCard/MissionCard'
import { METAS, PONTOS_POR_MISSAO, MISSOES_CONFIG } from '../../data/constants'

export default function MissoesPage() {
  const { refreshUsuario }        = useAuth()
  const [sincronizando, setSinc]  = useState(false)
  const [progresso,    setProg]   = useState(null)
  const [missoes,      setMissoes]= useState([])
  const [mensagem,     setMsg]    = useState(null)

  async function carregarDados() {
    const [prog, miss] = await Promise.all([api.getProgresso(), api.getMissoes()])
    setProg(prog)
    setMissoes(miss)
  }

  useEffect(() => { carregarDados() }, [])

  async function sincronizar() {
    setSinc(true)
    setMsg(null)
    try {
      // Simula busca do Google Health (mock)
      const { buscarDadosSaude } = await import('../../services/mockHealthApi')
      const dados = await buscarDadosSaude()
      await api.salvarProgresso({ passos: dados.passos, agua: dados.agua, sono: dados.sono, fonte: dados.fonte })
      await carregarDados()
      setMsg({ tipo: 'success', texto: 'Dados sincronizados com sucesso!' })
    } catch {
      setMsg({ tipo: 'error', texto: 'Erro ao sincronizar. Tente novamente.' })
    } finally {
      setSinc(false)
    }
  }

  async function concluirMissao(chave) {
    try {
      await api.concluirMissao({ chave_missao: chave })
      await carregarDados()
      await refreshUsuario()
      setMsg({ tipo: 'success', texto: `Missão "${chave}" concluída! Pontos adicionados.` })
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.data?.erro || 'Erro ao concluir missão.' })
    }
  }

  const dados           = progresso ?? { passos: 0, agua: 0, sono: 0 }
  const missoesConcluidas = missoes.map(m => m.chave_missao)

  return (
    <div>
      <header className="mb-6">
        <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Hoje</div>
        <h1 className="font-sora text-2xl font-extrabold text-text dark:text-d-text mt-0.5">Missões do Dia</h1>
        <p className="text-sm text-muted dark:text-d-muted mt-1">
          Sincronize com o Google Health para importar seus dados.
        </p>
      </header>

      {/* Barra de sync */}
      <div className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-4 flex items-center gap-3 mb-4">
        {sincronizando
          ? <div className="w-5 h-5 rounded-full border-2 border-cp-teal border-t-transparent animate-spin flex-shrink-0" />
          : <HeartPulse size={20} strokeWidth={1.75} className="text-cp-teal flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text dark:text-d-text">
            {sincronizando ? 'Sincronizando…' : 'Google Health'}
          </div>
          <div className="text-xs text-muted dark:text-d-muted truncate">
            {progresso ? `Sync realizado — ${dados.passos.toLocaleString('pt-BR')} passos` : 'Nenhuma sincronização hoje'}
          </div>
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          className="flex items-center gap-1.5 bg-cp-teal hover:bg-[#00a8c4] disabled:opacity-60 text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors flex-shrink-0"
        >
          <RefreshCw size={13} strokeWidth={2} />
          {sincronizando ? 'Aguarde…' : 'Sincronizar'}
        </button>
      </div>

      {/* Alerta */}
      {mensagem && (
        <div
          role="alert"
          className={`text-sm rounded-xl px-4 py-3 mb-4 ${
            mensagem.tipo === 'success'
              ? 'bg-cp-success/10 text-cp-success border border-cp-success/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {/* Cards de missão */}
      <section aria-label="Missões do dia" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MISSOES_CONFIG.map(({ chave, titulo, Icone, unidade, cor }) => {
          const concluida = missoesConcluidas.includes(chave)
          return (
            <div key={chave} className="flex flex-col gap-2">
              <MissionCard
                titulo={titulo}
                Icone={Icone}
                meta={METAS[chave]}
                atual={dados[chave] ?? 0}
                unidade={unidade}
                pontos={PONTOS_POR_MISSAO[chave]}
                concluida={concluida}
                cor={cor}
              />
              {!concluida && progresso && dados[chave] >= METAS[chave] && (
                <button
                  onClick={() => concluirMissao(chave)}
                  className="w-full bg-cp-success/10 hover:bg-cp-success/20 text-cp-success text-xs font-semibold rounded-full py-2 transition-colors"
                >
                  ✓ Marcar como concluída (+{PONTOS_POR_MISSAO[chave]} pts)
                </button>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/pages/DashboardPage/ frontend/src/pages/MissoesPage/
git commit -m "feat: migrate DashboardPage and MissoesPage to Tailwind + Django API"
```

---

## Task 9: PerfilPage e verificação final

**Files:**
- Modify: `frontend/src/pages/PerfilPage/PerfilPage.jsx`

- [ ] **Passo 1: Reescrever PerfilPage.jsx**

Conteúdo completo de `frontend/src/pages/PerfilPage/PerfilPage.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api }     from '../../services/api'

const BADGES_INFO = {
  primeiro_login:  { nome: 'Bem-vindo',           icone: '🌟' },
  primeira_missao: { nome: 'Primeiros Passos',    icone: '🏃' },
  caminhante:      { nome: 'Caminhante',          icone: '👟' },
  hidratado:       { nome: 'Hidratado',           icone: '💧' },
  bom_sono:        { nome: 'Dorminhoco Saudável', icone: '😴' },
}

export default function PerfilPage() {
  const { usuario } = useAuth()
  const [badges, setBadges] = useState([])

  useEffect(() => {
    api.getBadges().then(setBadges).catch(() => {})
  }, [])

  if (!usuario) return null

  return (
    <div>
      <header className="mb-6">
        <div className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted dark:text-d-muted">Conta</div>
        <h1 className="font-sora text-2xl font-extrabold text-text dark:text-d-text mt-0.5">Perfil</h1>
      </header>

      {/* Card de info */}
      <section aria-label="Informações pessoais" className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-5 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-cp-teal/15 flex items-center justify-center mb-3">
          <span className="font-sora text-xl font-extrabold text-cp-teal">
            {(usuario.first_name || usuario.username).charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="font-sora text-lg font-bold text-text dark:text-d-text">{usuario.first_name || usuario.username}</h2>
        <p className="text-sm text-muted dark:text-d-muted">{usuario.email}</p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-bg dark:bg-d-bg rounded-xl p-3">
            <div className="text-xs text-muted dark:text-d-muted mb-0.5">Pontos</div>
            <div className="font-sora text-xl font-extrabold text-cp-teal">{usuario.pontos}</div>
          </div>
          <div className="bg-bg dark:bg-d-bg rounded-xl p-3">
            <div className="text-xs text-muted dark:text-d-muted mb-0.5">Streak</div>
            <div className="font-sora text-xl font-extrabold text-cp-orange">{usuario.streak} dias</div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section aria-labelledby="badges-title" className="bg-card dark:bg-d-card border border-border dark:border-d-border rounded-2xl p-5">
        <h2 id="badges-title" className="font-sora text-base font-bold text-text dark:text-d-text mb-3">
          Conquistas ({badges.length})
        </h2>
        {badges.length === 0 ? (
          <p className="text-sm text-muted dark:text-d-muted">Complete missões para conquistar badges!</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {badges.map(b => {
              const info = BADGES_INFO[b.badge_id] ?? { nome: b.badge_id, icone: '🏆' }
              return (
                <li key={b.id} className="bg-bg dark:bg-d-bg rounded-xl p-3 flex items-center gap-2">
                  <span className="text-2xl">{info.icone}</span>
                  <span className="text-xs font-semibold text-text dark:text-d-text">{info.nome}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Passo 2: Rodar o app completo e verificar**

```bash
# Terminal 1 — backend
cd backend && python manage.py runserver

# Terminal 2 — frontend
cd frontend && npm run dev
```

Abrir `http://localhost:5173`. Fluxo esperado:
1. Tela de login aparece
2. Criar conta via "Criar conta"
3. Dashboard carrega com dados do Django
4. Sidebar mostra nova navegação (Dashboard, Missões, Chronicle, SENTINEL, Health Chains, Perfil)
5. Tema claro/escuro funciona

- [ ] **Passo 3: Commit final**

```bash
git add frontend/src/pages/PerfilPage/
git commit -m "feat: frontend foundation complete — Tailwind + auth + API connected"
```
