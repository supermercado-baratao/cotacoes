import type { TMarginTolerance } from '@/models'

// Piso/teto de margem inertes (nunca disparam alerta) até o usuário
// configurar valores reais em Configurações — 0/0 aqui sinalizaria toda
// margem positiva como "acima", inundando a tela por padrão.
export const DEFAULT_MARGIN_TOLERANCE: TMarginTolerance = {
  below: 0,
  above: 100
}

export const MAX_MARGIN_TOLERANCE = 100
