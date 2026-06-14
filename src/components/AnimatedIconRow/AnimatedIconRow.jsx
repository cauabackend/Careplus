// src/components/AnimatedIconRow/AnimatedIconRow.jsx
// Fileira de ícones que "desenham" entrando em stagger — recriação do efeito do
// componente anime.js do 21st.dev, porém em CSS/lucide puro (zero dep nova).
// O traço usa stroke-dasharray (herdado pelos paths do lucide). Respeita
// prefers-reduced-motion via a regra global do index.css.
export default function AnimatedIconRow({ icons = [], size = 30, gap = 20, replayKey = 0 }) {
  return (
    // key força remontagem → re-dispara a animação de "desenho"
    <div key={replayKey} style={{ display: 'flex', gap, justifyContent: 'center', alignItems: 'center' }}>
      {icons.map(({ Icon, color }, i) => (
        <Icon
          key={i}
          size={size}
          strokeWidth={1.6}
          className="icon-draw"
          style={{ color: color || 'var(--accent)', animationDelay: `${i * 0.13}s` }}
        />
      ))}
    </div>
  )
}
