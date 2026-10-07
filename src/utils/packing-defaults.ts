import type { TPackingDefault } from '@/models/packing-default-model/types'

const normalizePacking = (packing: string) => packing.trim().toUpperCase()

export const findPackingDefault = (
  packingDefaults: TPackingDefault[],
  {
    supplierId,
    productId,
    packing
  }: { supplierId: string; productId: string; packing: string }
): TPackingDefault | null =>
  packingDefaults.find(
    (d) =>
      d.supplierId === supplierId &&
      d.productId === productId &&
      normalizePacking(d.packing) === normalizePacking(packing)
  ) ?? null

export const findGroupPackingDefault = (
  packingDefaults: TPackingDefault[],
  supplierId: string,
  productIds: string[],
  packing: string
): number | null => {
  if (productIds.length === 0) return null
  const [first, ...rest] = productIds.map(
    (productId) =>
      findPackingDefault(packingDefaults, { supplierId, productId, packing })
        ?.packingQuantity ?? null
  )
  if (first == null) return null
  return rest.every((quantity) => quantity === first) ? first : null
}
