// src/pages/RegisterPage/RegisterPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PandaMascot from '../../components/PandaMascot/PandaMascot'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '12px',
  padding: '11px 14px',
  color: 'var(--text-primary)',
  fontSize: '0.82rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.18s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.6rem', fontWeight: '700',
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: '5px',
}

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
      className="app-bg vw-good"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
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
        style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}
      >
        {/* Panda + logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <PandaMascot healthState="good" size="sm" />
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--accent)', marginTop: '10px', marginBottom: '4px',
          }}>
            CarePlus+
          </div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: '800',
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            Criar conta
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Comece sua jornada de saúde hoje
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass"
          style={{ borderRadius: '20px', padding: '22px' }}
        >
          {erro && (
            <motion.div
              initial={{ opacity: 1, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              style={{
                fontSize: '0.78rem', fontWeight: '600',
                background: 'rgba(255,58,58,0.12)',
                border: '1px solid rgba(255,58,58,0.3)',
                color: '#FF3A3A',
                borderRadius: '10px', padding: '10px 14px',
                marginBottom: '14px',
              }}
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
            <div key={field.id} style={{ marginBottom: '12px' }}>
              <label htmlFor={field.id} style={labelStyle}>{field.label}</label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                required
                minLength={field.id === 'password' ? 6 : undefined}
                autoComplete={field.autocomplete}
                value={form[field.id]}
                onChange={handleChange}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)' }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.78rem', fontWeight: '800',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '12px', borderRadius: '999px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              fontFamily: 'inherit',
              boxShadow: '0 0 20px var(--accent-glow)',
              marginTop: '4px',
            }}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: '0.8rem',
          color: 'var(--text-muted)', marginTop: '14px',
        }}>
          Ja tem conta?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontWeight: '700',
              fontFamily: 'inherit', fontSize: 'inherit',
            }}
          >
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  )
}
