// src/components/Wordmark/Wordmark.jsx
// Marca CarePlus — wordmark limpo (sem caixinha/monograma genérico).
// "Care" sóbrio + "+" no acento como marca de recompensa. Anti "logo placeholder".
export default function Wordmark({ size = 'md', as: Tag = 'span' }) {
  const fs = size === 'lg' ? '1.6rem' : size === 'sm' ? '1rem' : '1.25rem'
  return (
    <Tag
      aria-label="CarePlus"
      className="inline-flex items-baseline gap-0 font-extrabold tracking-[-0.02em] text-[var(--text-primary)] leading-none select-none"
      style={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: fs,
      }}
    >
      Care
      <span className="font-normal italic text-[var(--accent)] ml-px" style={{
        fontFamily: 'var(--font-display)', fontSize: `calc(${fs} * 1.05)`,
      }}>
        +
      </span>
    </Tag>
  )
}
