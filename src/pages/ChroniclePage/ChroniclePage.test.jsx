import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ChroniclePage from './ChroniclePage'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: {
    getChronicle: vi.fn(),
  }
}))

vi.mock('../../hooks/useVitalsWeather', () => ({
  useVitalsWeather: () => ({ estado: 'excellent', score: 85, loading: false }),
}))

vi.mock('../../components/PandaMascot/PandaMascot', () => ({
  default: ({ healthState, pageContext }) => (
    <div data-testid="panda-mascot" data-health={healthState} data-context={pageContext} />
  ),
}))

const mockData = [
  { ano: 2026, mes: 5, dias_ativos: 18, total_dias: 31, densidade: 0.58 },
  { ano: 2026, mes: 4, dias_ativos: 25, total_dias: 30, densidade: 0.83 },
]

describe('ChroniclePage', () => {
  beforeEach(() => {
    api.getChronicle.mockResolvedValue(mockData)
  })

  it('renders the title "The Chronicle"', async () => {
    render(<MemoryRouter><ChroniclePage /></MemoryRouter>)
    expect(screen.getByText('The Chronicle')).toBeInTheDocument()
  })

  it('shows month name after data loads', async () => {
    render(<MemoryRouter><ChroniclePage /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/maio/i)).toBeInTheDocument()
    })
  })
})
