import type { TInvoice, TInvoiceItem } from '@/models/invoice/types'

// Fields added after some invoices were already stored. `undefined` = never
// stored (old invoice); `null` is a legitimate XML value (e.g. an item without
// CFOP) and is not overwritten.
const FISCAL_ITEM_FIELDS = [
  'tribUnit',
  'tribQuantity',
  'tribUnitPrice',
  'cfop',
  'totalCost'
] as const satisfies ReadonlyArray<keyof TInvoiceItem>

type TFiscalItemField = (typeof FISCAL_ITEM_FIELDS)[number]

export const hasMissingFiscalData = (
  invoice: Pick<TInvoice, 'operationNature' | 'items'>
): boolean =>
  invoice.operationNature === undefined ||
  invoice.items.some((item) =>
    FISCAL_ITEM_FIELDS.some((field) => item[field] === undefined)
  )

// Items are paired by item number and checked against the supplier code, so
// data from different items is never mixed, and the links, divergences and
// checking done in the app are kept.
export const completeInvoiceFiscalData = (
  existing: TInvoice,
  parsed: Pick<TInvoice, 'operationNature' | 'items'>
): Pick<TInvoice, 'id' | 'operationNature' | 'items'> => {
  const parsedItems = new Map(
    parsed.items.map((item) => [item.itemNumber, item])
  )

  const items = existing.items.map((item) => {
    const parsedItem = parsedItems.get(item.itemNumber)
    if (
      !parsedItem ||
      parsedItem.supplierProductCode !== item.supplierProductCode
    ) {
      return item
    }

    const missingFields = FISCAL_ITEM_FIELDS.filter(
      (field) => item[field] === undefined
    )
    if (missingFields.length === 0) return item

    const completion: Partial<Pick<TInvoiceItem, TFiscalItemField>> = {}
    for (const field of missingFields) {
      Object.assign(completion, { [field]: parsedItem[field] ?? null })
    }
    return { ...item, ...completion }
  })

  return {
    id: existing.id,
    operationNature:
      existing.operationNature === undefined
        ? (parsed.operationNature ?? null)
        : existing.operationNature,
    items
  }
}
