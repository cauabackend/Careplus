import { describe, it, expect } from 'vitest';
import { calcularScore, scoreParaEstado } from './useVitalsWeather';

describe('calcularScore', () => {
  it('retorna 0 para progresso null', () => {
    expect(calcularScore(null)).toBe(0);
  });

  it('retorna 0 para progresso undefined', () => {
    expect(calcularScore(undefined)).toBe(0);
  });

  it('retorna 100 para dia perfeito (8000 passos, 2L água, 8h sono)', () => {
    expect(calcularScore({ passos: 8000, agua: 2.0, sono: 8 })).toBe(100);
  });

  it('retorna 40 apenas com 8000 passos e sem agua/sono', () => {
    expect(calcularScore({ passos: 8000, agua: 0, sono: 0 })).toBe(40);
  });

  it('retorna 30 apenas com 2L de água e sem passos/sono', () => {
    expect(calcularScore({ passos: 0, agua: 2.0, sono: 0 })).toBe(30);
  });

  it('retorna 30 apenas com 8h de sono e sem passos/agua', () => {
    expect(calcularScore({ passos: 0, agua: 0, sono: 8 })).toBe(30);
  });

  it('retorna 0 com 4h de sono (limiar mínimo)', () => {
    expect(calcularScore({ passos: 0, agua: 0, sono: 4 })).toBe(0);
  });

  it('não ultrapassa 100 mesmo com valores acima das metas', () => {
    expect(calcularScore({ passos: 20000, agua: 5.0, sono: 12 })).toBe(100);
  });

  it('retorna score proporcional para meio caminho (4000 passos, 1L, 6h)', () => {
    // passos: (4000/8000)*40 = 20
    // agua:   (1.0/2.0)*30  = 15
    // sono:   (6-4)/(8-4)*30 = 2/4*30 = 15
    // total = 50
    expect(calcularScore({ passos: 4000, agua: 1.0, sono: 6 })).toBe(50);
  });
});

describe('scoreParaEstado', () => {
  it('retorna excellent para score >= 75', () => {
    expect(scoreParaEstado(75)).toBe('excellent');
    expect(scoreParaEstado(100)).toBe('excellent');
  });

  it('retorna good para score entre 50 e 74', () => {
    expect(scoreParaEstado(50)).toBe('good');
    expect(scoreParaEstado(74)).toBe('good');
  });

  it('retorna warning para score entre 25 e 49', () => {
    expect(scoreParaEstado(25)).toBe('warning');
    expect(scoreParaEstado(49)).toBe('warning');
  });

  it('retorna weak para score entre 10 e 24', () => {
    expect(scoreParaEstado(10)).toBe('weak');
    expect(scoreParaEstado(24)).toBe('weak');
  });

  it('retorna critical para score abaixo de 10', () => {
    expect(scoreParaEstado(0)).toBe('critical');
    expect(scoreParaEstado(9)).toBe('critical');
  });
});
