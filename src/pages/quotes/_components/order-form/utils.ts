export const getUnitPriceFromPackingPrice = (
  price: number,
  packingQuantity: number
): number => price / packingQuantity
