// src/pages/LoginPage/LoginPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import Wordmark from '../../components/Wordmark/Wordmark'

const inputClass =
  'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[12px] py-3 px-[14px] text-[var(--text-primary)] text-[0.85rem] font-[inherit] outline-none transition-[border-color] duration-[0.18s] box-border'

const labelClass =
  'block text-[0.62rem] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)] mb-[6px]'

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [erro,    setErro]    = useState(null)
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
    } catch {
      setErro('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="app-bg vw-excellent min-h-[100dvh] flex items-center justify-center py-6 px-4 relative overflow-hidden"
    >
      {/* Partículas atmosféricas */}
      {[8, 25, 45, 65, 80].map((left, i) => (
        <div
          key={i}
          className="particle"
          style={{ left: `${left}%`, bottom: 0, '--delay': `${i * 2.1}s`, '--dur': '14s' }}
        />
      ))}
      <div className="aurora-band b1" />
      <div className="aurora-band b2" />

      <motion.div
        initial={{ opacity: 1, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[360px] relative z-[1]"
      >
        {/* Panda + logo */}
        <div className="text-center mb-7">
          <PandaMascot healthState="excellent" size="md" event="app_open" />
          <div className="mt-3 mb-2">
            <Wordmark size="lg" />
          </div>
          <h1 className="text-[1.7rem] font-extrabold text-[var(--text-primary)] tracking-[-0.03em]">
            Bem-vindo de volta
          </h1>
          <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="glass rounded-[20px] p-6"
        >
          {erro && (
            <motion.div
              initial={{ opacity: 1, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="text-[0.8rem] font-semibold bg-[rgba(255,58,58,0.12)] border border-[rgba(255,58,58,0.3)] text-[#FF3A3A] rounded-[10px] py-[10px] px-[14px] mb-4"
            >
              {erro}
            </motion.div>
          )}

          <div className="mb-[14px]">
            <label htmlFor="username" className={labelClass}>Usuário</label>
            <input
              id="username" name="username" type="text"
              required autoComplete="username"
              value={form.username} onChange={handleChange}
              className={inputClass}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)' }}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className={labelClass}>Senha</label>
            <input
              id="password" name="password" type="password"
              required autoComplete="current-password"
              value={form.password} onChange={handleChange}
              className={inputClass}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[#fff] text-[0.8rem] font-extrabold tracking-[0.08em] uppercase p-[13px] rounded-full border-none font-[inherit] transition-opacity duration-[0.18s]"
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-[0.8rem] text-[var(--text-muted)] mt-4">
          Sem conta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="cursor-pointer text-[var(--accent)] font-bold font-[inherit] text-[length:inherit]"
            style={{ background: 'none', border: 'none' }}
          >
            Criar conta
          </button>
        </p>
      </motion.div>
    </div>
  )
}
