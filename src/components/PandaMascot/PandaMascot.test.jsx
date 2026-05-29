import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PandaMascot from './PandaMascot';

describe('PandaMascot', () => {
  it('renderiza sem erros com props padrão', () => {
    const { container } = render(<PandaMascot />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renderiza em tamanho lg (270px)', () => {
    const { container } = render(<PandaMascot size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '270');
  });

  it('renderiza em tamanho sm (120px)', () => {
    const { container } = render(<PandaMascot size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '120');
  });

  it('não exibe pálpebras em estado excellent', () => {
    const { container } = render(<PandaMascot healthState="excellent" />);
    const svg = container.querySelector('svg');
    const eyelids = Array.from(svg.querySelectorAll('ellipse')).filter(
      el => el.getAttribute('cx') === '107' && el.getAttribute('cy') === '112'
    );
    expect(eyelids).toHaveLength(0);
  });

  it('exibe pálpebras em estado critical', () => {
    const { container } = render(<PandaMascot healthState="critical" />);
    const svg = container.querySelector('svg');
    const eyelids = Array.from(svg.querySelectorAll('ellipse')).filter(
      el => el.getAttribute('cx') === '107' && el.getAttribute('cy') === '112'
    );
    expect(eyelids).toHaveLength(1);
  });

  it('exibe ZZZ em estado critical', () => {
    const { container } = render(<PandaMascot healthState="critical" />);
    const svg = container.querySelector('svg');
    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it('não exibe ZZZ em estado excellent', () => {
    const { container } = render(<PandaMascot healthState="excellent" />);
    const svg = container.querySelector('svg');
    const texts = svg.querySelectorAll('text');
    expect(texts).toHaveLength(0);
  });
});
