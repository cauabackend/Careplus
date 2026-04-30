// Simula a resposta de uma API de saúde (Google Fit / Apple Health)
// Em produção, essa função faria uma chamada HTTP após o fluxo OAuth2
const VARIACAO = (base, delta) =>
  Math.round((base + (Math.random() * 2 - 1) * delta) * 10) / 10

export async function buscarDadosSaude() {
  // Simula latência de rede (~1,5 s)
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    passos: Math.floor(VARIACAO(7200, 1800)),   // 5400–9000
    agua:   Math.round(VARIACAO(1.8, 0.6) * 10) / 10, // 1,2–2,4 L
    sono:   Math.round(VARIACAO(7.0, 1.5) * 10) / 10, // 5,5–8,5 h
    fonte:  'Google Health',
    dataSync: new Date().toISOString(),
  }
}
