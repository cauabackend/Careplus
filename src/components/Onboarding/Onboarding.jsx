// src/components/Onboarding/Onboarding.jsx
// Apresentação de primeiro acesso — cria vínculo com o panda em ~20s, sem
// prender o usuário em slides. Usa o efeito de ícones "desenhando" (AnimatedIconRow).
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Activity, Droplets, Moon, Award } from 'lucide-react'
import PandaMascot from '../PandaMascot/PandaMascot'
import Wordmark from '../Wordmark/Wordmark'
import AnimatedIconRow from '../AnimatedIconRow/AnimatedIconRow'

const STEPS = [
  {
    fala: 'Oi! Eu sou o Panda — seu companheiro de saúde. 🐼',
    titulo: 'Prazer, eu sou o Panda',
    texto: 'Vou estar com você todos os dias, torcendo por cada passo seu.',
  },
  {
    fala: 'A gente cuida disso junto, no seu ritmo.',
    titulo: 'Passos, água, sono e conquistas',
    texto: 'Pequenas missões diárias viram pontos, streak e badges.',
    icons: [{ Icon: Activity }, { Icon: Droplets }, { Icon: Moon }, { Icon: Award }],
  },
  {
    fala: 'Quando você cuida de você, eu fico feliz. ✨',
    titulo: 'O app muda com você',
    texto: 'Quanto mais saudável você estiver, mais vivo eu fico — e as cores do app acompanham seu bem-estar.',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const reduce = useReducedMotion()
  const atual = STEPS[step]
  const ultimo = step === STEPS.length - 1

  const variants = {
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -16 },
  }

  return (
    <div
      className="app-bg vw-excellent fixed inset-0 z-[70] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Apresentação do CarePlus"
      style={{
        padding: 'calc(env(safe-area-inset-top,0px) + 20px) 24px calc(env(safe-area-inset-bottom,0px) + 24px)',
      }}
    >
      {/* Topo: marca + pular */}
      <div className="flex justify-between items-center">
        <Wordmark size="md" />
        {!ultimo && (
          <button
            onClick={onComplete}
            className="cursor-pointer text-[var(--text-muted)] text-[13px] font-semibold"
            style={{ background: 'none', border: 'none' }}
          >
            Pular
          </button>
        )}
      </div>

      {/* Conteúdo central */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-[420px] mx-auto w-full">
        <PandaMascot healthState="excellent" size="lg" speechText={atual.fala} pose="dashboard" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mt-7"
          >
            {atual.icons && (
              <div className="mb-[22px]">
                <AnimatedIconRow icons={atual.icons} replayKey={step} size={32} />
              </div>
            )}
            <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-heading)] text-[var(--text-primary)] leading-[1.1]">
              {atual.titulo}
            </h2>
            <p className="text-[var(--text-muted)] mt-[10px] leading-[1.6] text-[0.95rem]">
              {atual.texto}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rodapé: dots + ação */}
      <div className="flex flex-col gap-[18px] items-center">
        <div className="flex gap-[7px]">
          {STEPS.map((_, i) => (
            <span key={i} className="h-[7px] rounded-full" style={{
              width: i === step ? 22 : 7,
              background: i === step ? 'var(--accent)' : 'var(--card-border)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => (ultimo ? onComplete() : setStep(s => s + 1))}
          className="w-full max-w-[420px] p-[15px] rounded-[var(--radius-pill)] border-none cursor-pointer text-[15px] font-bold bg-[var(--accent)] text-[#06121F]"
          style={{
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}
        >
          {ultimo ? 'Começar' : 'Próximo'}
        </motion.button>
      </div>
    </div>
  )
}
