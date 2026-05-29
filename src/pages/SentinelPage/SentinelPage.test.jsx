// src/pages/SentinelPage/SentinelPage.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SentinelPage from './SentinelPage';

vi.mock('../../services/api', () => ({
  api: {
    getSentinel: vi.fn().mockResolvedValue([]),
    marcarAlertaLido: vi.fn().mockResolvedValue({ lido: true }),
  },
}));

vi.mock('../../hooks/useVitalsWeather', () => ({
  useVitalsWeather: () => ({ estado: 'good', score: 60, loading: false }),
}));

describe('SentinelPage', () => {
  it('renderiza o título SENTINEL', async () => {
    render(<SentinelPage />);
    expect(screen.getByText('SENTINEL')).toBeInTheDocument();
  });

  it('exibe mensagem de tudo certo quando sem alertas', async () => {
    render(<SentinelPage />);
    await screen.findByText('Tudo certo por aqui!');
  });
});
