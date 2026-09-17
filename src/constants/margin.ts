import type { TMarginTolerance } from '@/models'

export const DEFAULT_MARGIN_TOLERANCE: TMarginTolerance = {
  below: 0,
  above: 0
}

export const MAX_MARGIN_TOLERANCE = 100

// Janela usada para calcular o custo médio real de um produto a partir das
// notas de entrada, antes de cair pro custo do catálogo (custocomimposto).
export const RECENT_COST_WINDOW_DAYS = 30
