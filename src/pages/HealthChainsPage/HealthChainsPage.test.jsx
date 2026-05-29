import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { api } from '../../services/api'
import HealthChainsPage from './HealthChainsPage'

vi.mock('../../services/api', () => ({
  api: {
    getConexoes: vi.fn(),
    getEventos: vi.fn(),
    getImpacto: vi.fn(),
    criarConexao: vi.fn(),
    removerConexao: vi.fn(),
  }
}))

vi.mock('../../hooks/useVitalsWeather', () => ({
  useVitalsWeather: () => ({ estado: 'good', score: 60, loading: false }),
}))

vi.mock('../../components/PandaMascot/PandaMascot', () => ({
  default: ({ healthState, pageContext }) => (
    <div data-testid="panda-mascot" data-health={healthState} data-context={pageContext} />
  ),
}))

const mockConexoes = [
  { id: 1, destino: { id: 2, username: 'maria', first_name: 'Maria' } },
]
const mockEventos = [
  { id: 1, origem: { username: 'joao' }, missao: 'passos', data: '2026-05-28' },
]
const mockImpacto = { total_beneficiados: 3 }

describe('HealthChainsPage', () => {
  beforeEach(() => {
    api.getConexoes.mockResolvedValue(mockConexoes)
    api.getEventos.mockResolvedValue(mockEventos)
    api.getImpacto.mockResolvedValue(mockImpacto)
  })

  it('renders the title "Health Chains"', () => {
    render(<MemoryRouter><HealthChainsPage /></MemoryRouter>)
    expect(screen.getByText('Health Chains')).toBeInTheDocument()
  })

  it('shows a connected friend after data loads', async () => {
    render(<MemoryRouter><HealthChainsPage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/Maria/i)).toBeInTheDocument()
    })
  })
})
