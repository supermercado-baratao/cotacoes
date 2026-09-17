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

export const evaluateMargin = (
  targetMargin: number,
  actualMargin: number,
  tolerance: TMarginTolerance
): TMarginEvaluation => {
  const marginGap = targetMargin - actualMargin
  if (marginGap > tolerance.below) return { status: 'below', marginGap }
  if (-marginGap > tolerance.above) return { status: 'above', marginGap }
  return { status: 'ok', marginGap }
}

export const marginStatusConfig: Record<
  TMarginStatus,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  below: { label: 'Abaixo da margem', color: 'error' },
  above: { label: 'Acima da margem', color: 'warning' },
  ok: { label: 'Dentro da margem', color: 'success' }
}
