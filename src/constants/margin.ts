import type { TMarginTolerance } from '@/models/settings/types'

// Inert floor/ceiling (never alert) until the user sets real values in
// Configurações: 0/0 would flag every positive margin as "above".
export const DEFAULT_MARGIN_TOLERANCE: TMarginTolerance = {
  below: 0,
  above: 100
}

export const MAX_MARGIN_TOLERANCE = 100

// Above this divergence between the invoice cost and the VR cost, the alert is
// marked as "attention": a sign of a wrong packing, an unidentified bonus or an
// outdated VR cost.
export const COST_DIVERGENCE_ATTENTION_PERCENT = 15
