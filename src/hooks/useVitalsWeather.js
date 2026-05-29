// src/hooks/useVitalsWeather.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Calcula o score de saúde do dia (0–100) a partir do progresso diário.
 *
 * Pesos:
 *   - Passos: meta 8000 → vale até 40 pontos
 *   - Água:   meta 2.0L → vale até 30 pontos
 *   - Sono:   meta 8h, limiar mínimo 4h → vale até 30 pontos
 *
 * @param {Object|null|undefined} progresso
 * @returns {number} Score de 0 a 100
 */
export function calcularScore(progresso) {
  if (!progresso) return 0;
  const { passos = 0, agua = 0, sono = 0 } = progresso;

  const passosScore = Math.min((passos / 8000) * 40, 40);
  const aguaScore   = Math.min((agua / 2.0) * 30, 30);
  const sonoNorm    = Math.max(0, Math.min((sono - 4) / (8 - 4), 1));
  const sonoScore   = sonoNorm * 30;

  return Math.round(passosScore + aguaScore + sonoScore);
}

/**
 * Mapeia score 0-100 para um dos 4 estados de saúde.
 *
 * @param {number} score
 * @returns {'excellent'|'good'|'warning'|'critical'}
 */
export function scoreParaEstado(score) {
  if (score >= 75) return 'excellent';
  if (score >= 50) return 'good';
  if (score >= 25) return 'warning';
  return 'critical';
}

/**
 * Hook React: busca o progresso de hoje via API e retorna o estado de saúde.
 *
 * @returns {{ estado: string, score: number, loading: boolean }}
 */
export function useVitalsWeather() {
  const [estado, setEstado]   = useState('good');
  const [score, setScore]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgresso()
      .then(progresso => {
        const s = calcularScore(progresso);
        setScore(s);
        setEstado(scoreParaEstado(s));
      })
      .catch(() => {
        setEstado('good');
        setScore(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return { estado, score, loading };
}
