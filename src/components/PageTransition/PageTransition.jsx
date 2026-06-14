// src/components/PageTransition/PageTransition.jsx
import { motion, useReducedMotion } from 'framer-motion'

export default function PageTransition({ children }) {
  // Animações do framer-motion são via JS (rAF) e NÃO leem o @media CSS de
  // prefers-reduced-motion — então respeitamos a preferência aqui explicitamente.
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: reduce ? 0 : -10 }}
      transition={{ duration: reduce ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}
