// src/components/ui/expandable-tabs.jsx
// Fonte: 21st.dev — victorwelander/expandable-tabs.
// Mantida a animação original (framer-motion). Adaptações para o CarePlus:
//   • cores via tokens do projeto (--accent, .glass) em vez de bg-muted/text-primary do shadcn;
//   • useOnClickOutside inline (sem depender de usehooks-ts);
//   • suporte a `selected` controlado (a navbar reflete a rota ativa).
import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'

// Hook local: fecha quando clica fora do container.
// Handler guardado em ref → listeners são anexados uma única vez (não re-bindam a cada render).
function useOnClickOutside(ref, handler) {
  const saved = React.useRef(handler)
  React.useEffect(() => { saved.current = handler })
  React.useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      saved.current(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener, { passive: true })
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref])
}

const buttonVariants = {
  initial: { gap: 0, paddingLeft: '.5rem', paddingRight: '.5rem' },
  animate: (isSelected) => ({
    gap: isSelected ? '.5rem' : 0,
    paddingLeft: isSelected ? '1rem' : '.5rem',
    paddingRight: isSelected ? '1rem' : '.5rem',
  }),
}

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit: { width: 0, opacity: 0 },
}

const transition = { delay: 0.1, type: 'spring', bounce: 0, duration: 0.6 }

function Separator() {
  return (
    <div
      aria-hidden="true"
      style={{ margin: '0 4px', height: 24, width: 1.2, background: 'var(--card-border)' }}
    />
  )
}

/**
 * @param {Array<{title?: string, icon?: any, type?: 'separator'}>} tabs
 * @param {string}   [className]
 * @param {number|null} [selected]      — modo controlado (reflete rota ativa)
 * @param {(i:number|null)=>void} [onChange]
 */
export function ExpandableTabs({ tabs, className, style, selected: controlled, onChange }) {
  const [internal, setInternal] = React.useState(null)
  const isControlled = controlled !== undefined
  const selected = isControlled ? controlled : internal
  const outsideRef = React.useRef(null)

  useOnClickOutside(outsideRef, () => {
    if (!isControlled) setInternal(null)
    onChange?.(null)
  })

  const handleSelect = (index) => {
    if (!isControlled) setInternal(index)
    onChange?.(index)
  }

  return (
    <div
      ref={outsideRef}
      className={cn('glass', className)}
      style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
        borderRadius: 999, padding: 6,
        ...style,
      }}
    >
      {tabs.map((tab, index) => {
        if (tab.type === 'separator') return <Separator key={`sep-${index}`} />

        const Icon = tab.icon
        const isActive = selected === index
        return (
          <motion.button
            key={tab.title}
            type="button"
            aria-label={tab.title}
            aria-current={isActive ? 'page' : undefined}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isActive}
            onClick={() => handleSelect(index)}
            transition={transition}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 44, minHeight: 44,   // alvo de toque mínimo (WCAG 2.5.5 / HIG)
              borderRadius: 999, padding: '8px 12px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color .3s, background .3s',
            }}
          >
            <Icon size={20} strokeWidth={1.75} />
            <AnimatePresence initial={false}>
              {isActive && tab.title && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  style={{ overflow: 'hidden' }}
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}
