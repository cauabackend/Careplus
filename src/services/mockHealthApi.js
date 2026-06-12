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
const PERFIS = [
  { nome: 'Crítico',   passos: 200,   agua: 0.1, sono: 4.0 },
  { nome: 'Fraco',     passos: 800,   agua: 0.4, sono: 4.2 },
  { nome: 'Normal',    passos: 2500,  agua: 0.8, sono: 5.0 },
  { nome: 'Bom',       passos: 5500,  agua: 1.5, sono: 7.2 },
  { nome: 'Excelente', passos: 10000, agua: 3.5, sono: 8.5 },
]

let indicePerfil = 0

export async function buscarDadosSaude() {
  await new Promise(resolve => setTimeout(resolve, 1000))

  const perfil = PERFIS[indicePerfil]
  indicePerfil = (indicePerfil + 1) % PERFIS.length

  console.info(`[mockHealthApi] → perfil "${perfil.nome}" (próximo: ${PERFIS[indicePerfil].nome})`, perfil)

  return {
    passos:   perfil.passos,
    agua:     perfil.agua,
    sono:     perfil.sono,
    fonte:    'Google Health',
    dataSync: new Date().toISOString(),
  }
}
