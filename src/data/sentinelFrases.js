// src/data/sentinelFrases.js
// "Sentinel" — a voz do mascote. O panda fala frases que refletem o estado
// atual dele (que espelha a saúde do usuário) e chamam a pessoa pra agir.
// Quanto pior o estado, mais o panda pede ajuda; quanto melhor, mais ele comemora.

export const SENTINEL_FRASES = {
  critical: [
    'Tô sem energia... uma caminhada já me faria reviver. Bora? 🐾',
    'Ai... mal consigo levantar. Um copo de água e uns passos me ajudam muito.',
    'Preciso de você hoje. Um pouquinho de atividade muda o meu dia.',
  ],
  weak: [
    'Tô meio pra baixo. Que tal a gente se mexer um pouquinho?',
    'Me sinto fraquinho... uns passos e mais água e eu já melhoro.',
    'Falta pouco pra eu voltar a me animar. Vem comigo?',
  ],
  warning: [
    'Hmm, dá pra melhorar. Vamos fechar uma missão juntos?',
    'Quase lá! Mais um esforço e eu fico bem mais alegre.',
    'Tô no caminho — me ajuda a chegar lá?',
  ],
  good: [
    'Tô bem! Mas a gente consegue chegar no topo, vem! 💪',
    'Indo bem! Mais um empurrãozinho e eu fico radiante.',
    'Gostei do ritmo de hoje. Bora manter?',
  ],
  excellent: [
    'Tô voando! 🎉 Você mandou muito bem hoje.',
    'Energia total! Obrigado por cuidar da gente. ✨',
    'Melhor dia! Continua assim que eu fico assim, feliz.',
  ],
}

// Retorna uma frase do estado. `seed` opcional torna a escolha determinística
// (útil em testes); sem seed, sorteia.
export function fraseSentinel(estado, seed) {
  const lista = SENTINEL_FRASES[estado] ?? SENTINEL_FRASES.good
  const i = seed == null
    ? Math.floor(Math.random() * lista.length)
    : seed % lista.length
  return lista[i]
}
