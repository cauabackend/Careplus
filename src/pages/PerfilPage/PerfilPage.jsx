// src/pages/PerfilPage/PerfilPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Zap, Award } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api }     from '../../services/api'
import PageTransition from '../../components/PageTransition/PageTransition'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

const BADGES_INFO = {
  primeiro_login:  { nome: 'Bem-vindo',           icon: Star  },
  primeira_missao: { nome: 'Primeiros Passos',    icon: Zap   },
  caminhante:      { nome: 'Caminhante',          icon: Award },
  hidratado:       { nome: 'Hidratado',           icon: Award },
  bom_sono:        { nome: 'Dorminhoco Saudável', icon: Award },
}

export default function PerfilPage() {
  const { usuario } = useAuth()
  const { estado } = useVitalsWeatherCtx()
  const [badges, setBadges] = useState([])

  useEffect(() => {
    api.getBadges().then(setBadges).catch(() => {})
  }, [])

  if (!usuario) return null

  const inicial = (usuario.first_name || usuario.username).charAt(0).toUpperCase()

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <header>
          <div className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[var(--accent)] mb-1">
            Conta
          </div>
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-[var(--text-primary)] tracking-[-0.025em]">
            Perfil
          </h1>
        </header>
        <PandaMascot
          healthState={estado}
          pose={badges.length > 0 ? 'profile-proud' : 'profile-shy'}
          size="sm"
        />
      </div>

      {/* Card de identidade */}
      <motion.section
        aria-label="Informações pessoais"
        className="glass rounded-[20px] p-6 mb-4"
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {/* Avatar (Radix — imagem quando houver, senão a inicial) */}
        <Avatar
          className="h-14 w-14 mb-4 border border-[var(--accent)]"
          style={{
            boxShadow: '0 0 16px var(--accent-glow)',
          }}
        >
          {usuario.avatar_url && (
            <AvatarImage src={usuario.avatar_url} alt={usuario.first_name || usuario.username} />
          )}
          <AvatarFallback className="text-[1.4rem]">{inicial}</AvatarFallback>
        </Avatar>

        <h2 className="text-[1.1rem] font-extrabold text-[var(--text-primary)] tracking-[-0.01em] mb-0.5">
          {usuario.first_name || usuario.username}
        </h2>
        <p className="text-[0.8rem] text-[var(--text-muted)] mb-5">
          {usuario.email}
        </p>

        {/* Estatísticas inline */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Pontos', valor: usuario.pontos },
            { label: 'Streak', valor: `${usuario.streak} dias` },
          ].map(({ label, valor }) => (
            <div key={label} className="glass rounded-[14px] py-3.5 px-4">
              <div className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1">
                {label}
              </div>
              <div className="text-[1.3rem] font-extrabold text-[var(--accent)] tracking-[-0.02em]">
                {valor}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Badges / Conquistas */}
      <section aria-labelledby="badges-title" className="glass rounded-[20px] p-6">
        <h2 id="badges-title" className="text-[0.92rem] font-extrabold text-[var(--text-primary)] tracking-[-0.01em] mb-3.5">
          Conquistas ({badges.length})
        </h2>

        {badges.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--text-muted)]">
            Complete missões para conquistar conquistas.
          </p>
        ) : (
          <div className="grid gap-2.5" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          }}>
            {badges.map((b, i) => {
              const info = BADGES_INFO[b.badge_id] ?? { nome: b.badge_id, icon: Award }
              const Icon = info.icon
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 1, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                  className="glass rounded-[14px] p-3.5 flex flex-col gap-2 items-start !border-[var(--accent)] bg-[var(--accent-soft)]"
                >
                  <div className="w-8 h-8 rounded-[10px] bg-[var(--accent-soft)] flex items-center justify-center">
                    <Icon size={16} className="text-[var(--accent)]" />
                  </div>
                  <span className="text-[0.72rem] font-bold text-[var(--text-primary)] leading-[1.2]">
                    {info.nome}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </PageTransition>
  )
}
