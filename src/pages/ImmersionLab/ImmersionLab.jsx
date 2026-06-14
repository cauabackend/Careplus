// src/pages/ImmersionLab/ImmersionLab.jsx
// ────────────────────────────────────────────────────────────────────────────
// LABORATÓRIO DE IMERSÃO — framer-motion
// Página isolada (rota /lab) que demonstra os 4 eixos de imersão sem depender
// do backend. Reusa os tokens do app: --accent, classes .vw-*, .glass e o
// PandaMascot. Serve de vitrine: o que aprovar daqui, a gente enxerta no app real.
// ────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { Activity, Droplets, Moon, Heart, Award, Zap, Home, Target, BookOpen, Link2, Star, CheckCircle2 } from 'lucide-react'
import PandaMascot from '../../components/PandaMascot/PandaMascot'
import { ExpandableTabs } from '../../components/ui/expandable-tabs'
import Gauge from '../../components/Gauge/Gauge'
import TrendChart from '../../components/TrendChart/TrendChart'
import BarChart from '../../components/BarChart/BarChart'
import Equalizer from '../../components/Equalizer/Equalizer'
import CalendarHeatmap from '../../components/CalendarHeatmap/CalendarHeatmap'
import Wordmark from '../../components/Wordmark/Wordmark'
import DashedPath from '../../components/DashedPath/DashedPath'
import StatCard from '../../components/StatCard/StatCard'
import MissionCard from '../../components/MissionCard/MissionCard'
import Onboarding from '../../components/Onboarding/Onboarding'
import { fraseSentinel } from '../../data/sentinelFrases'
import { escolherFala } from '../../data/pandaFalas'

const ESTADO_LABELS = { excellent: 'Excelente', good: 'Bom', warning: 'Atenção', weak: 'Fraco', critical: 'Crítico' }
const DIAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

/* Os 5 estados do Vitals Weather, com rótulo e cor de referência (só p/ os botões). */
const ESTADOS = [
  { id: 'excellent', label: 'Excelente', dot: '#37C3FF' },
  { id: 'good',      label: 'Bom',       dot: '#2DD75F' },
  { id: 'warning',   label: 'Alerta',    dot: '#FFA023' },
  { id: 'weak',      label: 'Fraco',     dot: '#8B7EBD' },
  { id: 'critical',  label: 'Crítico',   dot: '#FF3A3A' },
]

/* Mesmo array de partículas do DashboardLayout — reproveitado aqui. */
const PARTICLES = [
  { id: 0, left: '8%',  delay: '0s',   dur: '14s' }, { id: 1, left: '18%', delay: '2.1s', dur: '11s' },
  { id: 2, left: '29%', delay: '4.5s', dur: '16s' }, { id: 3, left: '41%', delay: '1.3s', dur: '13s' },
  { id: 4, left: '53%', delay: '6.2s', dur: '15s' }, { id: 5, left: '64%', delay: '3.7s', dur: '12s' },
  { id: 6, left: '75%', delay: '0.8s', dur: '17s' }, { id: 7, left: '87%', delay: '5.0s', dur: '10s' },
  { id: 8, left: '13%', delay: '7.4s', dur: '14s' }, { id: 9, left: '46%', delay: '9.1s', dur: '11s' },
]

/* Cards da grade do eixo 2 (shared layout) — cada um vira um painel ao clicar. */
const CARDS = [
  { id: 'passos', titulo: 'Passos',     Icone: Activity, valor: '8.240', desc: 'Você cruzou a meta diária. O panda está orgulhoso — cada passo virou ponto.' },
  { id: 'agua',   titulo: 'Hidratação', Icone: Droplets, valor: '2,1 L',  desc: 'Hidratação em dia. A barriga do mascote respira mais fundo quando você bebe água.' },
  { id: 'sono',   titulo: 'Sono',       Icone: Moon,     valor: '7,4 h',  desc: 'Boa noite de sono registrada. Menos bocejos, mais energia na próxima missão.' },
]

/* Eventos que o mascote sabe reagir (one-shot). */
const EVENTOS = [
  { id: 'mission_complete', label: 'Missão', Icone: Zap,   fala: 'Mais uma! 🎉' },
  { id: 'badge_earned',     label: 'Badge',  Icone: Award, fala: 'Conquista nova!' },
  { id: 'friend_helped',    label: 'Amigo',  Icone: Heart, fala: 'Você ajudou alguém 💙' },
]

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// ─── Eixo 3: card com tilt 3D ───────────────────────────────────────────────
// Desktop: segue o ponteiro (mouse/caneta/arraste).
// Celular: segue a INCLINAÇÃO FÍSICA do aparelho (giroscópio) — o equivalente
// premium do hover no toque. iOS 13+ exige permissão via toque (botão abaixo).
function TiltCard({ children }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0.5)   // 0..1 — fonte única; ponteiro E giroscópio escrevem aqui
  const my = useMotionValue(0.5)
  const handlerRef = useRef(null)
  const [needsPerm, setNeedsPerm] = useState(false)  // iOS aguardando toque de permissão
  const [gyroOn,    setGyroOn]    = useState(false)

  const rotX = useSpring(useTransform(my, [0, 1], reduce ? [0, 0] : [8, -8]),  { stiffness: 200, damping: 18 })
  const rotY = useSpring(useTransform(mx, [0, 1], reduce ? [0, 0] : [-10, 10]), { stiffness: 200, damping: 18 })

  // Ponteiro (desktop + fallback). Se o giroscópio assumiu, ele tem prioridade.
  function onMove(e) {
    if (gyroOn) return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top)  / r.height)
  }
  function onLeave() { if (!gyroOn) { mx.set(0.5); my.set(0.5) } }

  function attachGyro() {
    const h = (e) => {
      if (e.gamma == null && e.beta == null) return
      // gamma: esq/dir (-90..90) → eixo Y | beta: frente/trás → eixo X (centrado em ~45° de quem segura)
      mx.set(0.5 + clamp((e.gamma ?? 0) / 40, -0.5, 0.5))
      my.set(0.5 + clamp(((e.beta ?? 45) - 45) / 40, -0.5, 0.5))
    }
    handlerRef.current = h
    window.addEventListener('deviceorientation', h)
    setGyroOn(true)
  }

  async function enableGyro() {
    try {
      const res = await DeviceOrientationEvent.requestPermission()
      if (res === 'granted') { attachGyro(); setNeedsPerm(false) }
    } catch { /* usuário negou → fica no fallback de arraste */ }
  }

  // Detecta celular + sensor. Android anexa direto; iOS espera o toque de permissão.
  useEffect(() => {
    if (reduce) return
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    const hasDO  = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
    if (!coarse || !hasDO) return
    if (typeof DeviceOrientationEvent.requestPermission === 'function') setNeedsPerm(true)
    else attachGyro()
    return () => { if (handlerRef.current) window.removeEventListener('deviceorientation', handlerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        position: 'relative',
        rotateX: rotX, rotateY: rotY, transformPerspective: 900, transformStyle: 'preserve-3d',
        borderRadius: 6, padding: '22px 24px', willChange: 'transform',
      }}
      className="glass"
    >
      {children}
      {needsPerm && (
        <button
          onClick={enableGyro}
          style={{
            marginTop: 16, transform: 'translateZ(30px)', display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 6, border: '1px solid var(--accent)', cursor: 'pointer',
            background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, fontSize: 12,
          }}
        >
          Ativar profundidade (sensor)
        </button>
      )}
    </motion.div>
  )
}

export default function ImmersionLab() {
  const [estado,   setEstado]   = useState('excellent')
  const [aberto,   setAberto]   = useState(null)   // eixo 2: card expandido
  const [evento,   setEvento]   = useState(null)   // eixo 4: evento do mascote
  const [fala,     setFala]     = useState(null)
  const [flash,    setFlash]    = useState(0)      // eixo 1: pulso na virada de clima
  const [onbOpen,  setOnbOpen]  = useState(false)  // preview do onboarding
  const scrollRef = useRef(null)
  const falaTimer = useRef(null)
  const reduce    = useReducedMotion()

  // Eixo 3 (parallax): a atmosfera reage ao scroll do container (desligado em reduced-motion)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const atmosY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -120])

  // Eixo 4: mascote segue o cursor com inércia (sutil)
  const pmx = useSpring(0, { stiffness: 60, damping: 20 })
  const pmy = useSpring(0, { stiffness: 60, damping: 20 })
  function trackPanda(e) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    pmx.set(((e.clientX - r.left) / r.width  - 0.5) * 16)
    pmy.set(((e.clientY - r.top)  / r.height - 0.5) * 12)
  }

  function trocarClima(novo) {
    if (novo === estado) return
    setEstado(novo)
    setFlash(f => f + 1)        // dispara o pulso atmosférico (eixo 1)
    // Voz do Sentinel: o panda comenta o novo estado (chamado pra ação)
    if (falaTimer.current) clearTimeout(falaTimer.current)
    setFala(fraseSentinel(novo))
    falaTimer.current = setTimeout(() => setFala(null), 4200)
  }

  function dispararEvento(ev) {
    setEvento(null)
    if (falaTimer.current) clearTimeout(falaTimer.current)
    // força remount do prop event no próximo tick
    requestAnimationFrame(() => {
      setEvento(ev.id)
      setFala(ev.fala)
      falaTimer.current = setTimeout(() => setFala(null), 2200)
    })
  }

  const cardAberto = CARDS.find(c => c.id === aberto)

  // Fecha o painel expandido (eixo 2) com Esc — acessibilidade de modal
  useEffect(() => {
    if (!cardAberto) return
    const onKey = e => { if (e.key === 'Escape') setAberto(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cardAberto])

  return (
    <div
      ref={scrollRef}
      className={`app-bg vw-${estado}`}
      style={{ position: 'relative', minHeight: '100dvh', height: '100dvh', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* ─── EIXO 1: Atmosfera. Partículas renascem ao trocar de clima (AnimatePresence) ─── */}
      <motion.div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, y: atmosY }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={estado}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {PARTICLES.map(p => (
              <div key={p.id} className="particle"
                style={{ left: p.left, bottom: 0, '--delay': p.delay, '--dur': p.dur }} />
            ))}
            <div className="aurora-band b1" />
            <div className="aurora-band b2" />
            <div className="aurora-band b3" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Pulso de cor no instante da virada de clima — "o clima muda, você sente" */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={flash}
          aria-hidden="true"
          initial={{ opacity: 0.45 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 120% 100% at 50% 50%, var(--accent-glow), transparent 70%)',
          }}
        />
      </AnimatePresence>

      {/* ─── Conteúdo ─── */}
      <main style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px,5vw,56px) clamp(16px,5vw,48px)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 40 }}>

          <header>
            <p style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase' }}>
              Laboratório de Imersão · framer-motion
            </p>
            <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', fontWeight: 800, marginTop: 6 }}>
              Os 4 eixos, rodando ao vivo
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
              Troque o clima, abra um card, arraste o dedo e provoque o panda. Cada bloco abaixo é um eixo.
            </p>
          </header>

          {/* ═══ EIXO 1 — controle de clima ═══ */}
          <section>
            <SectionTitle n="01" t="Vitals Weather atmosférico" d="A troca de estado é um evento — partículas renascem, o fundo pulsa." />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ESTADOS.map(e => (
                <motion.button
                  key={e.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => trocarClima(e.id)}
                  className="glass"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999,
                    cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                    border: estado === e.id ? '1px solid var(--accent)' : undefined,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: e.dot, boxShadow: `0 0 8px ${e.dot}` }} />
                  {e.label}
                </motion.button>
              ))}
            </div>
          </section>

          {/* ═══ EIXO 2 — shared layout (layoutId) ═══ */}
          <section>
            <SectionTitle n="02" t="Transição contínua entre telas" d="Clique num card: ele morfa no painel via layoutId. É como rotas deveriam transicionar." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {CARDS.map(c => (
                <motion.button
                  key={c.id}
                  layoutId={`card-${c.id}`}
                  onClick={() => setAberto(c.id)}
                  className="glass"
                  whileHover={{ y: -3 }}
                  style={{ textAlign: 'left', padding: 18, borderRadius: 6, cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <motion.div layoutId={`icon-${c.id}`}
                    style={{ width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
                    <c.Icone size={20} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  </motion.div>
                  <motion.h3 layoutId={`titulo-${c.id}`} style={{ marginTop: 12, fontSize: 15, fontWeight: 700 }}>{c.titulo}</motion.h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{c.valor}</p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ═══ EIXO 3 — gestos físicos (tilt + parallax já ativo no scroll) ═══ */}
          <section>
            <SectionTitle n="03" t="Gestos físicos" d="No celular, incline o aparelho (giroscópio); no desktop, mova o ponteiro. A atmosfera faz parallax conforme você rola." />
            <TiltCard>
              <div style={{ transform: 'translateZ(40px)' }}>
                <Heart size={22} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>Profundidade sem peso</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
                  Incline o celular (ou mova o ponteiro): o card acompanha e o conteúdo flutua à frente (translateZ), amortecido por uma mola física.
                </p>
              </div>
            </TiltCard>
          </section>

          {/* ═══ EIXO 4 — mascote emocional ═══ */}
          <section>
            <SectionTitle n="04" t="Mascote emocional + voz do Sentinel" d="Troque o clima lá em cima: o panda fala uma frase do estado dele (o 'Sentinel' — chamado pra ação quando está mal). Também reage aos eventos e acompanha seu dedo." />
            <div className="glass" style={{ borderRadius: 8, padding: 24, display: 'grid', gap: 16, justifyItems: 'center' }}
              onPointerMove={trackPanda}
              onPointerLeave={() => { pmx.set(0); pmy.set(0) }}>
              <motion.div style={{ x: pmx, y: pmy }}>
                <PandaMascot healthState={estado} event={evento} speechText={fala} size="lg" />
              </motion.div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {EVENTOS.map(ev => (
                  <motion.button key={ev.id} whileTap={{ scale: 0.94 }} onClick={() => dispararEvento(ev)}
                    className="glass"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999,
                             cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                    <ev.Icone size={15} style={{ color: 'var(--accent)' }} /> {ev.label}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    if (falaTimer.current) clearTimeout(falaTimer.current)
                    setFala(escolherFala({ estado, hora: new Date().getHours() }))
                    falaTimer.current = setTimeout(() => setFala(null), 4200)
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999,
                           cursor: 'pointer', fontSize: 13, fontWeight: 700, border: '1px solid var(--accent)',
                           background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  Nova fala 🐼
                </motion.button>
              </div>
            </div>
          </section>

          {/* ═══ EIXO 5 — navbar nova (21st.dev expandable-tabs) ═══ */}
          <section>
            <SectionTitle n="05" t="Navbar — expandable tabs (21st.dev)" d="Prévia do efeito. No app real isto vira a barra inferior fixa (4 abas, mobile-first) e a aba ativa reflete a rota. Perfil é acessado pelo avatar no topo." />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ExpandableTabs
                style={{ flexWrap: 'nowrap' }}
                tabs={[
                  { title: 'Início',    icon: Home },
                  { title: 'Missões',   icon: Target },
                  { title: 'Crônica',   icon: BookOpen },
                  { title: 'Correntes', icon: Link2 },
                ]}
              />
            </div>
          </section>

          {/* ═══ EIXO 6 — Design v2 (direção Fusão + refs Behance) ═══ */}
          <section>
            <SectionTitle n="06" t="Design v2 — direção Fusão" d="Prévia da nova base visual: marca, anel de score, sparkline, cards sem caixinha e o motivo de caminho tracejado. As cores acompanham o clima escolhido acima." />

            {/* Wordmark + preview do onboarding */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <Wordmark size="lg" />
              <button
                onClick={() => setOnbOpen(true)}
                style={{ padding: '9px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                         border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                Ver onboarding 🐼
              </button>
            </div>

            {/* Gauge (velocímetro) */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 14, display: 'grid', justifyItems: 'center' }}>
              <VizHead esq="Vitals · agora" />
              <Gauge value={72} label="Score de saúde" estadoLabel={ESTADO_LABELS[estado]} size={210} />
            </div>

            {/* Tendência (curva suave) */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 }}>
              <VizHead esq="Score · 7 dias" dir="+18" />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', marginBottom: 6 }}>72</div>
              <TrendChart data={[40, 52, 48, 61, 57, 70, 72]} labels={DIAS} />
            </div>

            {/* Atividade (barras) */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 }}>
              <VizHead esq="Passos · 7 dias" />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', marginBottom: 10 }}>8.240</div>
              <BarChart data={[6200, 7100, 5400, 8200, 7600, 9100, 8240]} labels={DIAS} />
            </div>

            {/* Foco (equalizer) */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 }}>
              <VizHead esq="Foco · hoje" dir="14,5h" />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', marginBottom: 10 }}>73</div>
              <Equalizer data={Array.from({ length: 40 }, (_, i) => 0.28 + 0.62 * Math.abs(Math.sin(i * 0.5)))} />
            </div>

            {/* Constância (heatmap de calendário) */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 }}>
              <VizHead esq="Constância · este mês" dir="21/30" />
              <CalendarHeatmap
                startWeekday={3}
                values={Array.from({ length: 30 }, (_, i) => [0, 0.3, 0.6, 0.9, 0, 0.5, 1, 0.2, 0.7, 0.4][i % 10])}
              />
            </div>

            {/* Stats sem caixinha */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 14 }}>
              <StatCard label="Pontos"  valor={1240} Icone={Star} />
              <StatCard label="Streak"  valor={7} suffix="d" Icone={Zap} />
              <StatCard label="Badges"  valor={3} Icone={Award} />
              <StatCard label="Missões" valor={2} Icone={CheckCircle2} />
            </div>

            {/* Missões */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 14 }}>
              <MissionCard titulo="Passos"     Icone={Activity} meta={7500} atual={8240} unidade="passos" pontos={100} concluida />
              <MissionCard titulo="Hidratação" Icone={Droplets} meta={3}    atual={1.4}  unidade="L"      pontos={40} />
              <MissionCard titulo="Sono"       Icone={Moon}     meta={7}    atual={6}    unidade="horas"  pontos={60} />
            </div>

            {/* Caminho tracejado (motivo de assinatura) */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '18px 24px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Motivo: caminho tracejado conectando elementos</div>
              <DashedPath d="M8,64 C80,8 200,112 296,28" width={304} height={80} flow />
            </div>
          </section>

          <div style={{ height: 80 }} /> {/* espaço p/ sentir o parallax no scroll */}
        </div>
      </main>

      {/* ─── EIXO 2: painel expandido (overlay) ─── */}
      <AnimatePresence>
        {cardAberto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAberto(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center',
                     background: 'rgba(2,6,18,0.6)', backdropFilter: 'blur(4px)', padding: 20 }}
          >
            <motion.div
              layoutId={`card-${cardAberto.id}`}
              onClick={e => e.stopPropagation()}
              className="glass"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`lab-modal-${cardAberto.id}`}
              style={{ borderRadius: 10, padding: 32, maxWidth: 460, width: '100%', color: 'var(--text-primary)' }}
            >
              <motion.div layoutId={`icon-${cardAberto.id}`}
                style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
                <cardAberto.Icone size={28} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              </motion.div>
              <motion.h3 id={`lab-modal-${cardAberto.id}`} layoutId={`titulo-${cardAberto.id}`} style={{ marginTop: 16, fontSize: 24, fontWeight: 800 }}>
                {cardAberto.titulo}
              </motion.h3>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                style={{ color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.7 }}>
                {cardAberto.desc}
              </motion.p>
              <button onClick={() => setAberto(null)}
                style={{ marginTop: 22, padding: '10px 18px', borderRadius: 6, cursor: 'pointer',
                         background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, fontSize: 13, border: 'none' }}>
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview do onboarding */}
      {onbOpen && <Onboarding onComplete={() => setOnbOpen(false)} />}
    </div>
  )
}

/* Cabeçalho de card de gráfico: eyebrow à esquerda + métrica à direita. */
function VizHead({ esq, dir }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{esq}</span>
      {dir && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{dir}</span>}
    </div>
  )
}

/* Cabeçalho de seção reutilizado — número grande + título + descrição. */
function SectionTitle({ n, t, d }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{t}</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{d}</p>
    </div>
  )
}
