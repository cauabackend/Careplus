// Simula a resposta de uma API de saúde (Google Fit / Apple Health)
// Em produção, essa função faria uma chamada HTTP após o fluxo OAuth2

/**
 * Score = (passos/8000)×40 + (agua/2.0)×30 + ((sono-4)/4)×30  (máx 100)
 * Metas das missões: passos ≥ 7500 | agua ≥ 3 L | sono ≥ 7 h
 *
 * ┌─────────────┬────────┬──────┬──────┬───────┬───────────┬──────────────────────────┐
 * │ Perfil      │ Passos │ Água │ Sono │ Score │ Estado    │ Missões completáveis      │
 * ├─────────────┼────────┼──────┼──────┼───────┼───────────┼──────────────────────────┤
 * │ 1 Crítico   │   200  │  0.1 │  4.0 │  ~3   │ critical  │ nenhuma                  │
 * │ 2 Fraco     │   800  │  0.4 │  4.2 │  ~12  │ weak      │ nenhuma                  │
 * │ 3 Normal    │  2500  │  0.8 │  5.0 │  ~32  │ warning   │ nenhuma                  │
 * │ 4 Bom       │  5500  │  1.5 │  7.2 │  ~74  │ good      │ só sono                  │
 * │ 5 Excelente │ 10000  │  3.5 │  8.5 │  100  │ excellent │ todas (passos+água+sono) │
 * └─────────────┴────────┴──────┴──────┴───────┴───────────┴──────────────────────────┘
 */
// Cada perfil inclui também sinais vitais (batimentos, SpO2, temperatura) que
// acompanham o estado de saúde — pior estado = mais batimentos, menos SpO2 e
// mais febre. São exibidos no dashboard (read-only), não viram missão.
const PERFIS = [
  { nome: 'Crítico',   passos: 200,   agua: 0.1, sono: 4.0, batimentos: 122, spo2: 90, temperatura: 38.6 },
  { nome: 'Fraco',     passos: 800,   agua: 0.4, sono: 4.2, batimentos: 104, spo2: 93, temperatura: 37.8 },
  { nome: 'Normal',    passos: 2500,  agua: 0.8, sono: 5.0, batimentos: 88,  spo2: 96, temperatura: 37.1 },
  { nome: 'Bom',       passos: 5500,  agua: 1.5, sono: 7.2, batimentos: 74,  spo2: 98, temperatura: 36.7 },
  { nome: 'Excelente', passos: 10000, agua: 3.5, sono: 8.5, batimentos: 63,  spo2: 99, temperatura: 36.5 },
]

import { mqttHabilitado, iniciarMqtt, ultimaTelemetria } from './mqttClient'

// Modo Edge A: VITE_EDGE_URL aponta para o GET /telemetria do Node-RED (via HTTP).
const EDGE_URL = import.meta.env.VITE_EDGE_URL

// Garante que a conexão MQTT (modo Edge B) esteja ativa quando configurada.
iniciarMqtt()

const espera = ms => new Promise(resolve => setTimeout(resolve, ms))

/** Normaliza um payload de telemetria do dispositivo para o formato do app. */
function mapearTelemetria(t) {
  return {
    passos:      Number(t.passos) || 0,
    agua:        Number(t.agua)   || 0,
    sono:        Number(t.sono)   || 0,
    batimentos:  t.batimentos  != null ? Number(t.batimentos)  : undefined,
    spo2:        t.spo2        != null ? Number(t.spo2)        : undefined,
    temperatura: t.temperatura != null ? Number(t.temperatura) : undefined,
    fonte:       'CarePlus Band (ESP32)',
    dataSync:    new Date().toISOString(),
  }
}

let indicePerfil = 0

/** Lê o próximo perfil simulado, ciclando pelos 5 estados de saúde. */
function lerMock() {
  const perfil = PERFIS[indicePerfil]
  indicePerfil = (indicePerfil + 1) % PERFIS.length
  console.info(`[mockHealthApi] → perfil "${perfil.nome}" (próximo: ${PERFIS[indicePerfil].nome})`, perfil)
  return {
    passos:      perfil.passos,
    agua:        perfil.agua,
    sono:        perfil.sono,
    batimentos:  perfil.batimentos,
    spo2:        perfil.spo2,
    temperatura: perfil.temperatura,
    fonte:       'Google Health',
    dataSync:    new Date().toISOString(),
  }
}

export async function buscarDadosSaude() {
  // Modo Edge B — telemetria real direto do broker MQTT (HiveMQ) via WebSocket.
  if (mqttHabilitado) {
    let t = ultimaTelemetria()
    // Dá um tempo curto pra primeira mensagem chegar (ESP32 publica a cada ~2s).
    for (let i = 0; i < 12 && !t; i++) { await espera(250); t = ultimaTelemetria() }
    if (t) return mapearTelemetria(t)
    console.warn('[edge] sem telemetria MQTT ainda — usando simulação')
  }

  // Modo Edge A — telemetria via HTTP do Node-RED (GET /telemetria).
  if (EDGE_URL) {
    try {
      const res = await fetch(EDGE_URL, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return mapearTelemetria(await res.json())
    } catch (e) {
      console.warn('[edge] HTTP indisponível, usando simulação:', e.message)
    }
  }

  // Modo mock (padrão) — simula latência e cicla pelos 5 estados.
  await espera(1000)
  return lerMock()
}
