export const getUnitPriceFromPackingPrice = (
  price: number,
  packingQuantity: number
): number => price / packingQuantity

export type TExtractedPacking = {
  packing: string
  packingQuantity: number
}

// Word-based packing multipliers that don't spell out a number (e.g. "DZ" = dúzia).
// Add more abbreviations here as suppliers are found using them.
const WORD_PACKING_QUANTITIES: Record<string, number> = {
  DZ: 12,
  DZA: 12,
  DUZ: 12
}

/**
 * Splits a raw packing/unit string (as written by the supplier, e.g. "CX24",
 * "CX/24", "UN1", "DP/12", "DZ") into its packing type and quantity, so both
 * can be pre-filled instead of always defaulting quantity to 1. Letters and
 * digits are matched independently of order/separators, since suppliers are
 * inconsistent about "CX24" vs "24CX" vs "CX/24". Returns null when the text
 * carries no extractable quantity, so callers can fall back to their own
 * default.
 */
export const extractPackingInfo = (
  rawPacking: string
): TExtractedPacking | null => {
  const normalized = rawPacking.trim().toUpperCase()
  if (!normalized) return null

  const letters = normalized.replace(/[^A-Z]/g, '')
  const digits = normalized.match(/\d+/)?.[0]

  if (letters && digits) {
    const packingQuantity = Number(digits)
    if (packingQuantity > 0) return { packing: letters, packingQuantity }
  }

  const wordQuantity = WORD_PACKING_QUANTITIES[normalized]
  if (wordQuantity)
    return { packing: normalized, packingQuantity: wordQuantity }

  return null
}
