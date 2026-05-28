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
