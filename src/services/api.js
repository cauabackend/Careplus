/**
 * CarePlus+ — API local simulada (formato JSON).
 *
 * Em vez de um backend HTTP, esta camada simula uma API consumindo um
 * arquivo JSON local (src/data/db.json) e persistindo o estado no
 * localStorage do navegador. Mantém a MESMA interface pública (`api.*`)
 * e os mesmos formatos de resposta que o restante do app já espera, então
 * nenhuma página precisou mudar.
 *
 * Observação: as senhas no seed são apenas dados de demonstração de uma
 * API simulada no cliente — não há servidor nem segurança real envolvida.
 */
import seed from '../data/db.json'

// ── Chaves de armazenamento ────────────────────────────────────
const DB_KEY  = 'cp_db_v1'   // base de dados completa (JSON)
const UID_KEY = 'cp_uid'     // id do usuário logado

// ── Regras de negócio (espelham src/data/constants.js) ──────────
const PONTOS_POR_MISSAO = { passos: 100, agua: 40, sono: 60 }
const BADGE_POR_MISSAO  = { passos: 'caminhante', agua: 'hidratado', sono: 'bom_sono' }

const NOMES_MESES = [
  '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// ════════════════════════════════════════════════════════════════
// Utilidades de data e atraso simulado
// ════════════════════════════════════════════════════════════════

/** Data de hoje no formato ISO 'YYYY-MM-DD' (horário local). */
function hojeISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Converte um offset em dias (no passado) para data ISO. */
function isoDeDiasAtras(dias) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Simula a latência de uma chamada de rede e devolve o valor. */
function responder(valor, ms = 140) {
  return new Promise(resolve => setTimeout(() => resolve(structuredClone(valor)), ms))
}

/** Cria um erro no mesmo formato que o app já trata (err.data / err.status). */
function erroApi(data, status = 400) {
  const err = new Error(data.detail || data.erro || 'Erro na requisição')
  err.data = data
  err.status = status
  return err
}

// ════════════════════════════════════════════════════════════════
// Persistência da "base de dados" no localStorage
// ════════════════════════════════════════════════════════════════

/**
 * Carrega a base do localStorage; na primeira execução, semeia a partir
 * do db.json convertendo os offsets `dias_atras` em datas reais.
 */
function carregarDb() {
  const salvo = localStorage.getItem(DB_KEY)
  if (salvo) {
    try {
      return JSON.parse(salvo)
    } catch {
      // Base corrompida → recria a partir do seed.
    }
  }
  const db = {
    usuarios: structuredClone(seed.usuarios),
    progressos: seed.progressos.map(p => ({
      id: p.id, usuario_id: p.usuario_id, data: isoDeDiasAtras(p.dias_atras),
      passos: p.passos, agua: p.agua, sono: p.sono, fonte: p.fonte,
    })),
    missoes: seed.missoes.map(m => ({
      id: m.id, usuario_id: m.usuario_id, chave_missao: m.chave_missao,
      pontos_ganhos: m.pontos_ganhos, data: isoDeDiasAtras(m.dias_atras),
    })),
    badges: seed.badges.map(b => ({
      id: b.id, usuario_id: b.usuario_id, badge_id: b.badge_id,
      conquistada_em: isoDeDiasAtras(b.dias_atras),
    })),
    conexoes: seed.conexoes.map(c => ({
      id: c.id, origem_id: c.origem_id, destino_id: c.destino_id,
      criada_em: isoDeDiasAtras(c.dias_atras),
    })),
    chain_events: seed.chain_events.map(e => ({
      id: e.id, origem_id: e.origem_id, destino_id: e.destino_id,
      missao: e.missao, data: isoDeDiasAtras(e.dias_atras),
    })),
  }
  salvarDb(db)
  return db
}

/** Grava a base completa no localStorage. */
function salvarDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

/** Próximo id sequencial de uma coleção. */
function proximoId(lista) {
  return lista.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

/** Id do usuário logado (ou lança 401 se não houver sessão). */
function uidAtual() {
  const uid = Number(localStorage.getItem(UID_KEY))
  if (!uid) throw erroApi({ detail: 'Não autenticado.' }, 401)
  return uid
}

/** Recorta o usuário no formato público (espelha o UsuarioSerializer).
 *  Inclui badges_count quando a base é fornecida (o dashboard consome esse campo). */
function usuarioPublico(u, db = null) {
  const badges_count = db ? db.badges.filter(b => b.usuario_id === u.id).length : 0
  return { id: u.id, username: u.username, email: u.email,
           first_name: u.first_name, pontos: u.pontos, streak: u.streak, badges_count }
}

/** Versão "mini" do usuário usada nos objetos aninhados (amigos/eventos). */
function usuarioMini(u) {
  return u ? { id: u.id, username: u.username, first_name: u.first_name } : null
}

// ════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════

async function login({ username, password }) {
  const db = carregarDb()
  const u = db.usuarios.find(x => x.username === (username || '').trim())
  if (!u || u.password !== password) {
    throw erroApi({ detail: 'Usuário ou senha inválidos.' }, 401)
  }
  localStorage.setItem(UID_KEY, String(u.id))
  // Tokens simulados (mantém o formato { access, refresh } esperado).
  return responder({ access: `local-${u.id}`, refresh: `local-refresh-${u.id}` })
}

async function register({ first_name, username, email, password }) {
  const db = carregarDb()
  // Normaliza para evitar duplicatas por caixa/espaços e casar com a
  // busca por e-mail (sempre em minúsculas) usada em criarConexao.
  const emailNorm = (email || '').trim().toLowerCase()
  const userNorm  = (username || '').trim()

  if (db.usuarios.some(x => x.email === emailNorm)) {
    throw erroApi({ email: ['Este e-mail já está cadastrado.'] })
  }
  if (db.usuarios.some(x => x.username === userNorm)) {
    throw erroApi({ username: ['Este nome de usuário já existe.'] })
  }
  if (!password || password.length < 6) {
    throw erroApi({ password: ['A senha deve ter ao menos 6 caracteres.'] })
  }

  const novo = {
    id: proximoId(db.usuarios), username: userNorm, email: emailNorm,
    first_name: first_name || '', password, pontos: 0, streak: 0,
  }
  db.usuarios.push(novo)
  // Badge de boas-vindas (igual ao backend).
  db.badges.push({
    id: proximoId(db.badges), usuario_id: novo.id,
    badge_id: 'primeiro_login', conquistada_em: hojeISO(),
  })
  salvarDb(db)
  return responder(usuarioPublico(novo, db))
}

/** Stub mantido por compatibilidade (não há refresh real no modo local). */
async function refreshToken() {
  const uid = localStorage.getItem(UID_KEY)
  return responder({ access: `local-${uid}` })
}

// ════════════════════════════════════════════════════════════════
// USUÁRIO
// ════════════════════════════════════════════════════════════════

async function getUsuario() {
  const db = carregarDb()
  const u = db.usuarios.find(x => x.id === uidAtual())
  if (!u) throw erroApi({ detail: 'Usuário não encontrado.' }, 404)
  return responder(usuarioPublico(u, db))
}

async function updateUsuario({ first_name }) {
  const db = carregarDb()
  const u = db.usuarios.find(x => x.id === uidAtual())
  if (typeof first_name === 'string') u.first_name = first_name
  salvarDb(db)
  return responder(usuarioPublico(u, db))
}

// ════════════════════════════════════════════════════════════════
// PROGRESSO DIÁRIO
// ════════════════════════════════════════════════════════════════

function recortarProgresso(p) {
  return { id: p.id, data: p.data, passos: p.passos, agua: p.agua, sono: p.sono, fonte: p.fonte }
}

async function getProgresso() {
  const db = carregarDb()
  const uid = uidAtual()
  const p = db.progressos.find(x => x.usuario_id === uid && x.data === hojeISO())
  return responder(p ? recortarProgresso(p) : null)
}

async function salvarProgresso({ passos = 0, agua = 0, sono = 0, fonte = 'Manual' }) {
  // Validações equivalentes às do backend.
  if (passos < 0) throw erroApi({ passos: ['Passos não pode ser negativo.'] })
  if (agua < 0 || agua > 20) throw erroApi({ agua: ['Valor de água improvável (0–20L).'] })
  if (sono < 0 || sono > 24) throw erroApi({ sono: ['Sono deve ficar entre 0 e 24 horas.'] })

  const db = carregarDb()
  const uid = uidAtual()
  let p = db.progressos.find(x => x.usuario_id === uid && x.data === hojeISO())
  if (!p) {
    p = { id: proximoId(db.progressos), usuario_id: uid, data: hojeISO(),
          passos: 0, agua: 0, sono: 0, fonte: 'Manual' }
    db.progressos.push(p)
  }
  p.passos = passos
  p.agua = agua
  p.sono = sono
  p.fonte = fonte
  salvarDb(db)
  return responder(recortarProgresso(p))
}

async function getHistorico() {
  const db = carregarDb()
  const uid = uidAtual()
  const limite = isoDeDiasAtras(14)
  const historico = db.progressos
    .filter(x => x.usuario_id === uid && x.data >= limite)
    .sort((a, b) => (a.data < b.data ? 1 : -1))   // mais recente primeiro
    .map(recortarProgresso)
  return responder(historico)
}

// ════════════════════════════════════════════════════════════════
// MISSÕES
// ════════════════════════════════════════════════════════════════

function recortarMissao(m) {
  return { id: m.id, chave_missao: m.chave_missao, pontos_ganhos: m.pontos_ganhos, data: m.data }
}

async function getMissoes() {
  const db = carregarDb()
  const uid = uidAtual()
  const hoje = hojeISO()
  const lista = db.missoes
    .filter(x => x.usuario_id === uid && x.data === hoje)
    .map(recortarMissao)
  return responder(lista)
}

/** Concede badges após concluir missão; retorna ids realmente novos. */
function concederBadges(db, uid, chave) {
  const ganhas = []
  const candidatas = [BADGE_POR_MISSAO[chave], 'primeira_missao']
  for (const badgeId of candidatas) {
    const jaTem = db.badges.some(b => b.usuario_id === uid && b.badge_id === badgeId)
    if (!jaTem) {
      db.badges.push({ id: proximoId(db.badges), usuario_id: uid,
                       badge_id: badgeId, conquistada_em: hojeISO() })
      ganhas.push(badgeId)
    }
  }
  return ganhas
}

/** Cria ChainEvents para cada amigo conectado; retorna a quantidade criada. */
function criarChainEvents(db, uid, chave) {
  const hoje = hojeISO()
  const amigos = db.conexoes.filter(c => c.origem_id === uid)
  let count = 0
  for (const c of amigos) {
    const jaExiste = db.chain_events.some(e =>
      e.origem_id === uid && e.destino_id === c.destino_id &&
      e.missao === chave && e.data === hoje)
    if (!jaExiste) {
      db.chain_events.push({ id: proximoId(db.chain_events), origem_id: uid,
                             destino_id: c.destino_id, missao: chave, data: hoje })
      count++
    }
  }
  return count
}

async function concluirMissao({ chave_missao }) {
  const chave = (chave_missao || '').trim()
  if (!(chave in PONTOS_POR_MISSAO)) {
    throw erroApi({ erro: 'Missão inválida. Use: passos, agua ou sono.' })
  }

  const db = carregarDb()
  const uid = uidAtual()
  const hoje = hojeISO()

  const duplicada = db.missoes.some(m =>
    m.usuario_id === uid && m.chave_missao === chave && m.data === hoje)
  if (duplicada) throw erroApi({ erro: 'Missão já concluída hoje.' })

  const pontos = PONTOS_POR_MISSAO[chave]
  const missao = { id: proximoId(db.missoes), usuario_id: uid,
                   chave_missao: chave, pontos_ganhos: pontos, data: hoje }
  db.missoes.push(missao)

  // Atualiza pontos e streak do usuário.
  const u = db.usuarios.find(x => x.id === uid)
  u.pontos += pontos
  u.streak += 1

  const badges_ganhas = concederBadges(db, uid, chave)
  const chain_events_criados = criarChainEvents(db, uid, chave)

  salvarDb(db)
  return responder({
    missao: recortarMissao(missao),
    pontos_ganhos: pontos,
    pontos_total: u.pontos,
    badges_ganhas,
    chain_events_criados,
  }, 200)
}

// ════════════════════════════════════════════════════════════════
// BADGES
// ════════════════════════════════════════════════════════════════

async function badges() {
  const db = carregarDb()
  const uid = uidAtual()
  const lista = db.badges
    .filter(b => b.usuario_id === uid)
    .map(b => ({ id: b.id, badge_id: b.badge_id, conquistada_em: b.conquistada_em }))
  return responder(lista)
}

// ════════════════════════════════════════════════════════════════
// THE CHRONICLE (agregação mensal de missões)
// ════════════════════════════════════════════════════════════════

async function getChronicle() {
  const db = carregarDb()
  const uid = uidAtual()

  // Agrupa dias distintos com missão por mês (ano-mês → Set de datas).
  const porMes = new Map()
  for (const m of db.missoes.filter(x => x.usuario_id === uid)) {
    const [ano, mes] = m.data.split('-').map(Number)
    // Ignora datas malformadas (base editada à mão) para não gerar mês inválido.
    if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) continue
    const chave = `${ano}-${mes}`
    if (!porMes.has(chave)) porMes.set(chave, { ano, mes, dias: new Set() })
    porMes.get(chave).dias.add(m.data)
  }

  const meses = [...porMes.values()]
    .sort((a, b) => (b.ano - a.ano) || (b.mes - a.mes))   // mais recente primeiro
    .map(({ ano, mes, dias }) => {
      const total_dias = new Date(ano, mes, 0).getDate()   // dias do mês
      const dias_ativos = dias.size
      return {
        ano, mes,
        mes_nome: NOMES_MESES[mes],
        dias_ativos,
        total_dias,
        densidade: Math.round((dias_ativos / total_dias) * 100) / 100,
      }
    })

  return responder(meses)
}

// ════════════════════════════════════════════════════════════════
// HEALTH CHAINS
// ════════════════════════════════════════════════════════════════

async function getConexoes() {
  const db = carregarDb()
  const uid = uidAtual()
  const lista = db.conexoes
    .filter(c => c.origem_id === uid)
    .map(c => ({
      id: c.id,
      destino: usuarioMini(db.usuarios.find(u => u.id === c.destino_id)),
      criada_em: c.criada_em,
    }))
  return responder(lista)
}

async function criarConexao({ destino_email }) {
  const db = carregarDb()
  const uid = uidAtual()
  const destino = db.usuarios.find(u => u.email === (destino_email || '').toLowerCase())

  if (!destino) throw erroApi({ detail: 'Usuário com este e-mail não encontrado.' }, 404)
  if (destino.id === uid) throw erroApi({ detail: 'Você não pode se conectar a si mesmo.' })
  if (db.conexoes.some(c => c.origem_id === uid && c.destino_id === destino.id)) {
    throw erroApi({ detail: 'Vocês já estão conectados.' })
  }

  const conexao = { id: proximoId(db.conexoes), origem_id: uid,
                    destino_id: destino.id, criada_em: hojeISO() }
  db.conexoes.push(conexao)
  salvarDb(db)
  return responder({ id: conexao.id, destino: usuarioMini(destino), criada_em: conexao.criada_em }, 200)
}

async function removerConexao(id) {
  const db = carregarDb()
  const uid = uidAtual()
  db.conexoes = db.conexoes.filter(c => !(c.id === id && c.origem_id === uid))
  salvarDb(db)
  return responder(null, 120)
}

async function getEventos() {
  const db = carregarDb()
  const uid = uidAtual()
  const mapear = e => ({
    id: e.id,
    origem: usuarioMini(db.usuarios.find(u => u.id === e.origem_id)),
    destino: usuarioMini(db.usuarios.find(u => u.id === e.destino_id)),
    missao: e.missao,
    data: e.data,
  })
  return responder({
    recebidos: db.chain_events.filter(e => e.destino_id === uid).map(mapear),
    causados:  db.chain_events.filter(e => e.origem_id === uid).map(mapear),
  })
}

async function getImpacto() {
  const db = carregarDb()
  const uid = uidAtual()
  const ano = new Date().getFullYear()
  const pessoas = new Set(
    db.chain_events
      .filter(e => e.origem_id === uid && Number(e.data.slice(0, 4)) === ano)
      .map(e => e.destino_id)
  ).size
  return responder({ pessoas_beneficiadas: pessoas, ano })
}

// ════════════════════════════════════════════════════════════════
// Interface pública (mesma assinatura usada em todo o app)
// ════════════════════════════════════════════════════════════════

export const api = {
  // Auth
  login,
  register,
  refreshToken,
  // Usuário
  getUsuario,
  updateUsuario,
  // Progresso
  getProgresso,
  salvarProgresso,
  getHistorico,
  // Missões
  getMissoes,
  concluirMissao,
  // Badges
  getBadges: badges,
  // Chronicle
  getChronicle,
  // Health Chains
  getConexoes,
  criarConexao,
  removerConexao,
  getEventos,
  getImpacto,
}
