// src/pages/PreviewPage/PreviewPage.jsx
// Página temporária de comparação: Vídeo vs SVG
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import { useVitalsWeatherCtx } from '../../context/VitalsWeatherContext'

function OptionCard({ label, tag, children, pros, cons }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      {/* Rótulo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--accent)',
          background: 'var(--accent-soft)', border: '1px solid var(--accent)',
          borderRadius: '999px', padding: '4px 12px',
        }}>
          {tag}
        </span>
        <span style={{
          fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)',
        }}>
          {label}
        </span>
      </div>

      {/* Preview box */}
      <div className="glass" style={{
        borderRadius: '20px', overflow: 'hidden',
        minHeight: '320px', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)',
      }}>
        {children}
      </div>

      {/* Pros / Cons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="glass" style={{ borderRadius: '14px', padding: '14px' }}>
          <div style={{
            fontSize: '0.6rem', fontWeight: '800', color: '#2DD75F',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Prós
          </div>
          {pros.map((p, i) => (
            <div key={i} style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              lineHeight: 1.55, marginBottom: '4px',
            }}>
              ✓ {p}
            </div>
          ))}
        </div>
        <div className="glass" style={{ borderRadius: '14px', padding: '14px' }}>
          <div style={{
            fontSize: '0.6rem', fontWeight: '800', color: '#FF3A3A',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Contras
          </div>
          {cons.map((c, i) => (
            <div key={i} style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              lineHeight: 1.55, marginBottom: '4px',
            }}>
              ✗ {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Simulação do card de vitais para o SVG se sentar em cima */
function VitalsCardMock({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', padding: '24px' }}>
      {/* Panda posicionado em cima do card */}
      <div style={{
        position: 'absolute', top: '-10px', right: '20px', zIndex: 2,
      }}>
        {children}
      </div>

      {/* Card falso de vitais */}
      <div className="glass" style={{
        borderRadius: '18px', padding: '20px 22px',
        marginTop: '20px', position: 'relative',
      }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px',
        }}>
          Vitals Weather
        </div>
        <div style={{
          fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Score 74 / 100
        </div>
        <div style={{
          marginTop: '10px', height: '6px', borderRadius: '999px',
          background: 'rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: '74%', height: '100%', borderRadius: '999px',
            background: 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 60%, white))',
          }} />
        </div>
        <div style={{
          marginTop: '14px', display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        }}>
          {[
            { label: 'Passos', val: '5.500' },
            { label: 'Água',   val: '1,5 L' },
            { label: 'Sono',   val: '7,2 h' },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent)' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const { estado } = useVitalsWeatherCtx()

  return (
    <div style={{ padding: '0 0 48px' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px',
        }}>
          Comparação
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800',
          color: 'var(--text-primary)', letterSpacing: '-0.025em',
        }}>
          Mascote — Vídeo vs SVG
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Pose do Dashboard: panda sentado em cima do card de vitais.
        </p>
      </div>

      {/* Cards lado a lado */}
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>

        {/* ── Opção A: Vídeo ── */}
        <OptionCard
          tag="Opção A"
          label="Vídeo MP4"
          pros={[
            'Animação rica e fluida',
            'Qualidade visual alta',
            'Zero código de animação',
          ]}
          cons={[
            'Estático — não reage ao score',
            'Sem toque/reatividade',
            'Peso do arquivo (~MB)',
            'Sem estados (excellent/crítico…)',
          ]}
        >
          <VitalsCardMock>
            {/* Sem container — panda flutua direto sobre o card */}
            {/* WebM com canal alpha real — transparência nativa em todos os browsers */}
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: 190, display: 'block' }}
            >
              <source src="/panda-hero.webm" type="video/webm" />
              <source src="/panda-hero.mp4"  type="video/mp4" />
            </video>
          </VitalsCardMock>
        </OptionCard>

        {/* ── Opção B: SVG ── */}
        <OptionCard
          tag="Opção B"
          label="SVG Animado"
          pros={[
            'Reage ao score (5 estados)',
            'Toque interativo',
            'Peso zero (~0 KB extra)',
            'Cores seguem o tema do app',
          ]}
          cons={[
            'Pose menos detalhada',
            'Personagem mais simples',
          ]}
        >
          <VitalsCardMock>
            <PandaMascot
              healthState={estado}
              pose="dashboard"
              size="md"
            />
          </VitalsCardMock>
        </OptionCard>
      </div>

      {/* Nota */}
      <div className="glass" style={{
        borderRadius: '16px', padding: '16px 20px', marginTop: '24px',
        borderColor: 'var(--accent)', background: 'var(--accent-soft)',
        fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        💡 <strong style={{ color: 'var(--text-primary)' }}>Opção híbrida possível:</strong>{' '}
        usar o vídeo apenas na Hero do Dashboard (pose fixa) e manter o SVG nas demais abas
        (Missões, Chronicle, Perfil) onde a reatividade importa mais.
        Ou converter o vídeo para <strong style={{ color: 'var(--text-primary)' }}>Lottie JSON</strong> via
        {' '}<a href="https://lottiefiles.com" target="_blank" rel="noreferrer"
          style={{ color: 'var(--accent)' }}>LottieFiles.com</a>{' '}
        — mantém a qualidade do vídeo e adiciona controle programático.
      </div>
    </div>
  )
}
