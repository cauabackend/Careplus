import { Activity, Droplets, Moon, Coffee, Brain, Stethoscope, Pill, Trophy, Star, Zap, Award, CheckCircle2, Gift } from 'lucide-react'

export const PONTOS_POR_MISSAO = {
  passos: 100,
  agua:   40,
  sono:   60,
}

export const METAS = {
  passos: 7500,
  agua:   3,
  sono:   7,
}

export const CATALOGO = [
  { id: 1, nome: 'Garrafa térmica CarePlus',       preco: 250, categoria: 'Bem-estar', Icone: Coffee,      cor: '#00BFDF' },
  { id: 2, nome: '1 mês de meditação guiada',      preco: 180, categoria: 'Mental',    Icone: Brain,       cor: '#A855F7' },
  { id: 3, nome: 'Consulta nutricional online',    preco: 500, categoria: 'Saúde',     Icone: Stethoscope, cor: '#10B981' },
  { id: 4, nome: 'Voucher R$30 farmácia parceira', preco: 400, categoria: 'Desconto',  Icone: Pill,        cor: '#F97316' },
  { id: 5, nome: 'Kit camiseta + faixa esportiva', preco: 320, categoria: 'Fitness',   Icone: Trophy,      cor: '#F59E0B' },
]

export const BADGES_DISPONIVEIS = [
  { id: 'primeiro_login',  nome: 'Bem-vindo',           descricao: 'Conta criada no CarePlus.',        icone: '🌟' },
  { id: 'primeira_missao', nome: 'Primeiros Passos',    descricao: 'Concluiu a primeira missão.',      icone: '🏃' },
  { id: 'caminhante',      nome: 'Caminhante',          descricao: 'Bateu a meta de passos do dia.',   icone: '👟' },
  { id: 'hidratado',       nome: 'Hidratado',           descricao: 'Bateu a meta de hidratação.',      icone: '💧' },
  { id: 'bom_sono',        nome: 'Dorminhoco Saudável', descricao: 'Dormiu o suficiente.',             icone: '😴' },
  { id: 'resgate_feito',   nome: 'Primeira Troca',      descricao: 'Resgatou um item do catálogo.',    icone: '🎁' },
]

/*
 * Icone → componente React do lucide-react (uppercase = convenção)
 * cor   → cor de identidade da missão (usada na borda e no ícone)
 */
export const MISSOES_CONFIG = [
  {
    chave:   'passos',
    titulo:  'Caminhar',
    Icone:   Activity,
    unidade: 'passos',
    badge:   'caminhante',
    max:     15000,
    step:    500,
    cor:     '#00BFDF',
  },
  {
    chave:   'agua',
    titulo:  'Ingestão de Água',
    Icone:   Droplets,
    unidade: 'L',
    badge:   'hidratado',
    max:     5,
    step:    0.25,
    cor:     '#6366F1',
  },
  {
    chave:   'sono',
    titulo:  'Sono',
    Icone:   Moon,
    unidade: 'horas',
    badge:   'bom_sono',
    max:     12,
    step:    0.5,
    cor:     '#A855F7',
  },
]

// Ícones de StatCard centralizados para evitar repetição nas páginas
export const STAT_ICONS = { Star, Zap, Award, CheckCircle2, Gift }
