/**
 * Cliente MQTT (modo Edge B) — conexão DIRETA do navegador ao broker HiveMQ
 * via WebSocket seguro (wss), sem Node-RED nem servidor local.
 *
 * Fluxo: ESP32 → HiveMQ Cloud → (wss) → este cliente no app.
 *
 * Tudo é controlado por variáveis de ambiente (ver .env.example). Sem
 * VITE_MQTT_URL definida, o módulo fica inerte e o app usa o mock.
 */
const URL   = import.meta.env.VITE_MQTT_URL          // ex: wss://xxx.hivemq.cloud:8884/mqtt
const USER  = import.meta.env.VITE_MQTT_USER
const PASS  = import.meta.env.VITE_MQTT_PASS
const TOPIC = import.meta.env.VITE_MQTT_TOPIC || 'fiap/careplus/healthtracker'

/** true quando o modo MQTT está configurado. */
export const mqttHabilitado = !!URL

let cliente = null
let iniciando = false
let ultimaLeitura = null   // último payload JSON recebido do dispositivo

/**
 * Abre a conexão e assina o tópico. Idempotente.
 * A lib `mqtt` é carregada sob demanda (dynamic import) — só entra no bundle
 * quando o modo Edge está realmente configurado.
 */
export async function iniciarMqtt() {
  if (!URL || cliente || iniciando) return
  iniciando = true

  const { default: mqtt } = await import('mqtt')

  cliente = mqtt.connect(URL, {
    username: USER || undefined,
    password: PASS || undefined,
    reconnectPeriod: 4000,
    connectTimeout: 8000,
    clean: true,
  })

  cliente.on('connect', () => {
    console.info('[mqtt] conectado:', URL)
    cliente.subscribe(TOPIC, err => {
      if (err) console.warn('[mqtt] falha ao assinar', TOPIC, err.message)
      else console.info('[mqtt] assinando tópico:', TOPIC)
    })
  })

  cliente.on('message', (_topic, payload) => {
    try {
      ultimaLeitura = JSON.parse(payload.toString())
    } catch {
      console.warn('[mqtt] payload não-JSON ignorado')
    }
  })

  cliente.on('error', e => console.warn('[mqtt] erro:', e.message))
}

/** Retorna a última telemetria recebida (ou null se nada chegou ainda). */
export function ultimaTelemetria() {
  return ultimaLeitura
}
