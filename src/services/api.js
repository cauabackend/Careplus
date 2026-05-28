/**
 * CarePlus+ V2 — Camada de API centralizada.
 * Todos os fetches do app passam por aqui.
 * Base URL: http://localhost:8000/api
 */

const BASE = 'http://localhost:8000/api'

/** Lê o access token do localStorage. */
function getToken() {
  return localStorage.getItem('cp_access')
}

/**
 * Faz uma requisição HTTP autenticada.
 * Lança erro com { status, data } se a resposta não for 2xx.
 */
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.detail || data.erro || 'Erro na requisição')
    err.status = res.status
    err.data   = data
    throw err
  }

  return data
}

const get  = (path)       => request('GET',    path)
const post = (path, body) => request('POST',   path, body)
const put  = (path, body) => request('PUT',    path, body)
const del  = (path)       => request('DELETE', path)

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  login:           (data) => post('/auth/login/',    data),
  register:        (data) => post('/auth/register/', data),
  refreshToken:    (data) => post('/auth/refresh/',  data),

  // ── Usuário ────────────────────────────────────────────────
  getUsuario:      ()     => get('/usuario/'),
  updateUsuario:   (data) => put('/usuario/', data),

  // ── Progresso ──────────────────────────────────────────────
  getProgresso:    ()     => get('/progresso/'),
  salvarProgresso: (data) => post('/progresso/', data),
  getHistorico:    ()     => get('/progresso/historico/'),

  // ── Missões ────────────────────────────────────────────────
  getMissoes:      ()     => get('/missoes/'),
  concluirMissao:  (data) => post('/missoes/', data),

  // ── Badges ────────────────────────────────────────────────
  getBadges:       ()     => get('/badges/'),

  // ── SENTINEL ──────────────────────────────────────────────
  getSentinel:     ()     => get('/sentinel/'),
  marcarAlertaLido:(id)   => put(`/sentinel/${id}/`, { lido: true }),

  // ── Chronicle ─────────────────────────────────────────────
  getChronicle:    ()     => get('/chronicle/'),

  // ── Health Chains ─────────────────────────────────────────
  getConexoes:     ()     => get('/chains/conexoes/'),
  criarConexao:    (data) => post('/chains/conexoes/', data),
  removerConexao:  (id)   => del(`/chains/conexoes/${id}/`),
  getEventos:      ()     => get('/chains/eventos/'),
  getImpacto:      ()     => get('/chains/impacto/'),
}
