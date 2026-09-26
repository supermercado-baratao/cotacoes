import { DEFAULT_MARGIN_TOLERANCE } from '@/constants'
import type { TMarginTolerance, TSettings } from '@/models'

export type TMarginStatus = 'below' | 'ok' | 'above'

export type TMarginEvaluation = {
  status: TMarginStatus
  marginGap: number
}

export const getMarginTolerance = (
  settings: TSettings | null,
  departmentId: string | null
): TMarginTolerance => {
  const override = departmentId
    ? settings?.departmentMarginTolerances?.[departmentId]
    : undefined
  return override ?? settings?.marginTolerance ?? DEFAULT_MARGIN_TOLERANCE
}

// Piso/teto globais (ou por departamento) de margem, não mais uma tolerância
// de desvio em torno da margem própria do produto — `tolerance.below` é a
// margem mínima aceitável, `tolerance.above` a máxima esperada.
export const evaluateMargin = (
  actualMargin: number,
  tolerance: TMarginTolerance
): TMarginEvaluation => {
  if (actualMargin < tolerance.below) {
    return { status: 'below', marginGap: tolerance.below - actualMargin }
  }
  if (actualMargin > tolerance.above) {
    return { status: 'above', marginGap: actualMargin - tolerance.above }
  }
  return { status: 'ok', marginGap: 0 }
}

export const marginStatusConfig: Record<
  TMarginStatus,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  below: { label: 'Abaixo da margem', color: 'error' },
  above: { label: 'Acima da margem', color: 'warning' },
  ok: { label: 'Dentro da margem', color: 'success' }
}
