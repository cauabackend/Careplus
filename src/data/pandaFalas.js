// src/data/pandaFalas.js
// A "personalidade" do panda — várias falas contextuais (estilo coruja do Duolingo)
// para criar vínculo com o usuário. O Sentinel (falas por estado de saúde) é o
// núcleo emocional; aqui ele ganha companhia: saudações, streak, missões e
// frases de personalidade. A função escolherFala() monta a fala certa pro momento.
import { SENTINEL_FRASES } from './sentinelFrases'

const SAUDACAO = {
  manha: [
    'Bom dia! ☀️ Um copo de água já é um ótimo começo.',
    'Acordou! Bora movimentar esse corpo cedinho?',
    'Manhã nova, metas novas. Tô contigo! 🐼',
  ],
  tarde: [
    'Boa tarde! Já bebeu água nas últimas horas?',
    'Meio do dia... que tal uns passos pra desentortar?',
    'Tarde combina com uma caminhada, não acha?',
  ],
  noite: [
    'Boa noite! Bora garantir um sono caprichado hoje?',
    'Fim de dia — fecha as missões antes de dormir? 🌙',
    'Antes de deitar: dormir bem me deixa forte.',
  ],
}

// {n} é substituído pelo tamanho do streak
const STREAK_ATIVO = [
  '{n} dias seguidos! 🔥 Não quebra a ofensiva agora.',
  'Olha esse streak de {n} dias! Tô muito orgulhoso.',
  '{n} dias sem falhar. Hoje a gente mantém, né?',
]
const STREAK_ZERADO = [
  'Que tal começar uma ofensiva nova hoje? Eu começo com você.',
  'Sem streak ainda — bora acender essa chama? 🔥',
]

const PERSONALIDADE = [
  'Sabia que panda come bambu o dia todo? Eu prefiro te ver treinando. 🎋',
  'Senti sua falta! 🐼',
  'Você cuidando de você cuida de mim também.',
  'Tô aqui torcendo por cada passo seu.',
  'A gente forma um bom time, viu?',
]

const MISSAO = [
  'Falta pouco pra fechar as missões de hoje!',
  'Bora completar uma missão? Fico tão feliz quando você consegue.',
  'Cada missão é energia pra mim. Vem!',
]

function periodo(hora) {
  if (hora < 12) return 'manha'
  if (hora < 18) return 'tarde'
  return 'noite'
}

function pick(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

/**
 * Monta a fala do panda para o momento atual.
 * @param {object}   ctx
 * @param {string}   [ctx.estado='good']  estado de saúde (Vitals Weather)
 * @param {number}   [ctx.hora=12]        hora do dia (0-23)
 * @param {number}   [ctx.streak=0]       dias de ofensiva
 * @returns {string}
 */
export function escolherFala({ estado = 'good', hora = 12, streak = 0 } = {}) {
  // Panda mal → o chamado de saúde (Sentinel) tem prioridade absoluta.
  if (estado === 'critical' || estado === 'weak') {
    return pick(SENTINEL_FRASES[estado] ?? SENTINEL_FRASES.weak)
  }

  // Caso contrário, monta um leque de candidatos contextuais e sorteia.
  const pool = [
    ...SAUDACAO[periodo(hora)],
    ...(streak > 0 ? STREAK_ATIVO.map(f => f.replace('{n}', String(streak))) : STREAK_ZERADO),
    ...(SENTINEL_FRASES[estado] ?? SENTINEL_FRASES.good),
    ...PERSONALIDADE,
    ...MISSAO,
  ]
  return pick(pool)
}
