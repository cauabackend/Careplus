import { describe, it, expect } from 'vitest'
import { escolherFala } from './pandaFalas'
import { SENTINEL_FRASES } from './sentinelFrases'

describe('escolherFala', () => {
  it('prioriza o chamado de saúde quando o estado é crítico', () => {
    // Em critical, sempre retorna uma frase do Sentinel daquele estado.
    for (let i = 0; i < 20; i++) {
      expect(SENTINEL_FRASES.critical).toContain(escolherFala({ estado: 'critical' }))
    }
  })

  it('prioriza o chamado de saúde quando o estado é fraco', () => {
    for (let i = 0; i < 20; i++) {
      expect(SENTINEL_FRASES.weak).toContain(escolherFala({ estado: 'weak' }))
    }
  })

  it('interpola o streak no template {n} (sem deixar placeholder)', () => {
    // good + streak>0 pode sortear a frase de streak; nunca deve sobrar "{n}".
    for (let i = 0; i < 50; i++) {
      expect(escolherFala({ estado: 'good', streak: 7 })).not.toContain('{n}')
    }
  })

  it('não quebra com estado inválido (cai no pool padrão)', () => {
    expect(() => escolherFala({ estado: 'xyz' })).not.toThrow()
    expect(typeof escolherFala({ estado: 'xyz' })).toBe('string')
  })

  it('usa valores padrão quando chamada sem argumentos', () => {
    expect(typeof escolherFala()).toBe('string')
  })
})
