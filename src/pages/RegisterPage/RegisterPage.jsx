// src/pages/RegisterPage/RegisterPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PandaMascot from '../../components/PandaMascot/PandaMascot'

const inputClass =
  'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[12px] py-[11px] px-[14px] text-[var(--text-primary)] text-[0.82rem] font-[inherit] outline-none transition-[border-color] duration-[0.18s] box-border'

const labelClass =
  'block text-[0.6rem] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)] mb-[5px]'

export default function RegisterPage({ onSwitchToLogin }) {
  const { login } = useAuth()
  const [form,    setForm]    = useState({ first_name: '', username: '', email: '', password: '' })
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
      await api.register(form)
      await login(form.username, form.password)
    } catch (err) {
      const msg = err.data?.email?.[0] || err.data?.username?.[0] || 'Erro ao criar conta.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="app-bg vw-good min-h-[100dvh] flex items-center justify-center py-6 px-4 relative overflow-hidden"
    >
      {/* Partículas */}
      {[10, 30, 55, 75, 90].map((left, i) => (
        <div
          key={i}
          className="particle"
          style={{ left: `${left}%`, bottom: 0, '--delay': `${i * 1.8}s`, '--dur': '14s' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 1, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[360px] relative z-[1]"
      >
        {/* Panda + logo */}
        <div className="text-center mb-6">
          <PandaMascot healthState="good" size="sm" />
          <div className="text-[0.6rem] font-bold tracking-[0.28em] uppercase text-[var(--accent)] mt-[10px] mb-1">
            CarePlus+
          </div>
          <h1 className="text-[1.6rem] font-extrabold text-[var(--text-primary)] tracking-[-0.03em]">
            Criar conta
          </h1>
          <p className="text-[0.78rem] text-[var(--text-muted)] mt-1">
            Comece sua jornada de saúde hoje
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass rounded-[20px] p-[22px]"
        >
          {erro && (
            <motion.div
              initial={{ opacity: 1, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="text-[0.78rem] font-semibold bg-[rgba(255,58,58,0.12)] border border-[rgba(255,58,58,0.3)] text-[#FF3A3A] rounded-[10px] py-[10px] px-[14px] mb-[14px]"
            >
              {erro}
            </motion.div>
          )}

          {[
            { id: 'first_name', label: 'Nome',     type: 'text',     autocomplete: 'given-name' },
            { id: 'username',   label: 'Usuário',   type: 'text',     autocomplete: 'username'   },
            { id: 'email',      label: 'E-mail',    type: 'email',    autocomplete: 'email'      },
            { id: 'password',   label: 'Senha (mín. 6)',type:'password', autocomplete: 'new-password'},
          ].map(field => (
            <div key={field.id} className="mb-3">
              <label htmlFor={field.id} className={labelClass}>{field.label}</label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                required
                minLength={field.id === 'password' ? 6 : undefined}
                autoComplete={field.autocomplete}
                value={form[field.id]}
                onChange={handleChange}
                className={inputClass}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)' }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[#fff] text-[0.78rem] font-extrabold tracking-[0.08em] uppercase p-3 rounded-full border-none font-[inherit] mt-1"
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-[0.8rem] text-[var(--text-muted)] mt-[14px]">
          Ja tem conta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="cursor-pointer text-[var(--accent)] font-bold font-[inherit] text-[length:inherit]"
            style={{ background: 'none', border: 'none' }}
          >
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  )
}
