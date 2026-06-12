// src/pages/PerfilPage/PerfilPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Zap, Award } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api }     from '../../services/api'
import PageTransition from '../../components/PageTransition/PageTransition'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
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
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', gap: '16px',
        marginBottom: '32px',
      }}>
        <header>
          <div style={{
            fontSize: '0.6rem', fontWeight: '700',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: '4px',
          }}>
            Conta
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
          }}>
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
        className="glass"
        style={{ borderRadius: '20px', padding: '24px', marginBottom: '16px' }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {/* Avatar */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 0 16px var(--accent-glow)',
        }}>
          <span style={{
            fontSize: '1.4rem', fontWeight: '800',
            color: 'var(--accent)',
          }}>
            {inicial}
          </span>
        </div>

        <h2 style={{
          fontSize: '1.1rem', fontWeight: '800',
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
          marginBottom: '2px',
        }}>
          {usuario.first_name || usuario.username}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {usuario.email}
        </p>

        {/* Estatísticas inline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Pontos', valor: usuario.pontos },
            { label: 'Streak', valor: `${usuario.streak} dias` },
          ].map(({ label, valor }) => (
            <div key={label} className="glass" style={{
              borderRadius: '14px', padding: '14px 16px',
            }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: '700',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: '4px',
              }}>
                {label}
              </div>
              <div style={{
                fontSize: '1.3rem', fontWeight: '800',
                color: 'var(--accent)', letterSpacing: '-0.02em',
              }}>
                {valor}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Badges / Conquistas */}
      <section aria-labelledby="badges-title" className="glass" style={{ borderRadius: '20px', padding: '24px' }}>
        <h2 id="badges-title" style={{
          fontSize: '0.92rem', fontWeight: '800',
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
          marginBottom: '14px',
        }}>
          Conquistas ({badges.length})
        </h2>

        {badges.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Complete missões para conquistar conquistas.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
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
                  className="glass"
                  style={{
                    borderRadius: '14px', padding: '14px',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    alignItems: 'flex-start',
                    borderColor: 'var(--accent)',
                    background: 'var(--accent-soft)',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: 'var(--accent-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '700',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}>
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
