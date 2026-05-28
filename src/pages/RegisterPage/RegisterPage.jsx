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
