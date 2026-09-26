import type { TInvoice, TInvoiceItem } from '@/models'

// Campos extraídos do XML que foram adicionados depois que parte das notas já
// estava no Firestore. `undefined` = campo nunca gravado (nota antiga); `null`
// é um valor legítimo vindo do XML (ex: item sem CFOP) e não é sobrescrito.
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

// Completa só os campos fiscais ausentes da nota já gravada com os do XML
// reenviado — vínculos (productId/orderId), divergências e a situação de
// conferência feitos no app são preservados. Itens são pareados pelo número
// do item e conferidos pelo código do fornecedor, pra nunca misturar dados
// de itens diferentes.
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
    if (!missingFields.length) return item

    const completion: Partial<Pick<TInvoiceItem, TFiscalItemField>> = {}
    missingFields.forEach((field) => {
      Object.assign(completion, { [field]: parsedItem[field] ?? null })
    })
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
