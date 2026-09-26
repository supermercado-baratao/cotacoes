import type { TMarginTolerance } from '@/models'

// Piso/teto de margem inertes (nunca disparam alerta) até o usuário
// configurar valores reais em Configurações — 0/0 aqui sinalizaria toda
// margem positiva como "acima", inundando a tela por padrão.
export const DEFAULT_MARGIN_TOLERANCE: TMarginTolerance = {
  below: 0,
  above: 100
}

export const MAX_MARGIN_TOLERANCE = 100

// Divergência (em %) entre o custo calculado pelas notas de entrada e o
// custo com imposto do VR a partir da qual o alerta de margem é marcado como
// "atenção" — sinal de embalagem errada, bonificação não identificada ou
// custo desatualizado no VR.
export const COST_DIVERGENCE_ATTENTION_PERCENT = 15
