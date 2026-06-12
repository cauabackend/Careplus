// src/pages/LoginPage/LoginPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import PandaMascot from '../../components/PandaMascot/PandaMascot'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.18s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.62rem',
  fontWeight: '700',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '6px',
}

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
      className="app-bg vw-excellent"
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
        style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}
      >
        {/* Panda + logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <PandaMascot healthState="excellent" size="md" event="app_open" />
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--accent)', marginTop: '12px', marginBottom: '4px',
          }}>
            CarePlus+
          </div>
          <h1 style={{
            fontSize: '1.7rem', fontWeight: '800',
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            Bem-vindo de volta
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="glass"
          style={{ borderRadius: '20px', padding: '24px' }}
        >
          {erro && (
            <motion.div
              initial={{ opacity: 1, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              style={{
                fontSize: '0.8rem', fontWeight: '600',
                background: 'rgba(255,58,58,0.12)',
                border: '1px solid rgba(255,58,58,0.3)',
                color: '#FF3A3A',
                borderRadius: '10px', padding: '10px 14px',
                marginBottom: '16px',
              }}
            >
              {erro}
            </motion.div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="username" style={labelStyle}>Usuário</label>
            <input
              id="username" name="username" type="text"
              required autoComplete="username"
              value={form.username} onChange={handleChange}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={labelStyle}>Senha</label>
            <input
              id="password" name="password" type="password"
              required autoComplete="current-password"
              value={form.password} onChange={handleChange}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.8rem', fontWeight: '800',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '13px', borderRadius: '999px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              fontFamily: 'inherit',
              boxShadow: '0 0 20px var(--accent-glow)',
              transition: 'opacity 0.18s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: '0.8rem',
          color: 'var(--text-muted)', marginTop: '16px',
        }}>
          Sem conta?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontWeight: '700',
              fontFamily: 'inherit', fontSize: 'inherit',
            }}
          >
            Criar conta
          </button>
        </p>
      </motion.div>
    </div>
  )
}
