// src/components/FloatingNav/FloatingNav.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, Target, BookOpen, Shield, Link2, User, X,
} from 'lucide-react'

const LINKS = [
  { path: '/',          label: 'Início',    Icon: Home     },
  { path: '/missoes',   label: 'Missões',   Icon: Target   },
  { path: '/sentinel',  label: 'Sentinel',  Icon: Shield   },
  { path: '/chronicle', label: 'Crônica',   Icon: BookOpen },
  { path: '/chains',    label: 'Correntes', Icon: Link2    },
  { path: '/perfil',    label: 'Perfil',    Icon: User     },
]

export default function FloatingNav() {
  const [open, setOpen] = useState(false)
  const navigate        = useNavigate()
  const { pathname }    = useLocation()

  function go(path) {
    navigate(path)
    setOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(2px)',
          zIndex: 49,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Contentor fixo */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        left:   '28px',
        zIndex: 50,
      }}>

        {/* ── Nav panel ── */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: 0,
          background:     'var(--card-bg)',
          border:         '1px solid var(--accent)',
          borderRadius:   '20px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding:        '16px 12px',
          minWidth:       '170px',
          boxShadow:      '0 0 40px var(--accent-glow)',
          transformOrigin: 'bottom left',
          /* CSS-only expand/collapse */
          opacity:   open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(12px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Fechar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px',
                display: 'flex', borderRadius: '8px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Links */}
          <nav>
            {LINKS.map(({ path, label, Icon }) => {
              const active = pathname === path || (path !== '/' && pathname.startsWith(path))
              return (
                <button
                  key={path}
                  onClick={() => go(path)}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '10px',
                    width:      '100%',
                    padding:    '10px 12px',
                    borderRadius: '12px',
                    border:     'none',
                    cursor:     'pointer',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    color:      active ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'inherit',
                    fontSize:   '0.82rem',
                    fontWeight: active ? '700' : '500',
                    letterSpacing: '0.01em',
                    transition: 'background 0.18s, color 0.18s',
                    marginBottom: '2px',
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.2 : 1.8}
                    style={{ color: 'inherit', flexShrink: 0 }}
                  />
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Indicador */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderTop: '1px solid var(--card-border)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
            }} />
            <span style={{
              fontSize: '0.65rem', fontWeight: '600',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--accent)',
            }}>
              CarePlus+
            </span>
          </div>
        </div>

        {/* ── Ponto flutuante ── */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu de navegação'}
          style={{
            width:        '14px',
            height:       '14px',
            borderRadius: '50%',
            background:   'var(--accent)',
            border:       'none',
            cursor:       'pointer',
            boxShadow:    '0 0 0 3px var(--accent-soft), 0 0 20px var(--accent-glow)',
            animation:    open ? 'none' : 'dotPulse 2.5s ease-in-out infinite',
            padding:      0,
            opacity:      open ? 0.3 : 1,
            transform:    open ? 'scale(0.7)' : 'scale(1)',
            transition:   'opacity 0.18s, transform 0.18s',
            position:     'relative',
            zIndex:       1,
          }}
        />
      </div>
    </>
  )
}
