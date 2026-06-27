import type { TFamily, TProduct, TQuote } from '@/models'

type TPrintItem = {
  description: string
  refLabel: string
  refType: 'product' | 'family' | null
}

type TPrintGroup = {
  label: string
  items: TPrintItem[]
}

const buildGroups = (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[]
): TPrintGroup[] => {
  const familyMap = new Map<string, TPrintGroup>()
  const uncategorized: TPrintItem[] = []

  for (const item of quote.items) {
    const ref = item.priceRef
    let familyId: string | null = null
    let refLabel = ''
    let refType: TPrintItem['refType'] = null

    if (ref?.type === 'product') {
      const product = products.find((p) => p.id === ref.id)
      refLabel = product?.description ?? ''
      refType = 'product'
      familyId = product?.familyId ?? null
    } else if (ref?.type === 'family') {
      const family = families.find((f) => f.id === ref.id)
      refLabel = family?.description ?? ''
      refType = 'family'
      familyId = ref.id
    }

    const entry: TPrintItem = {
      description: item.description,
      refLabel,
      refType
    }

    if (!familyId) {
      uncategorized.push(entry)
      continue
    }

    if (!familyMap.has(familyId)) {
      const family = families.find((f) => f.id === familyId)
      familyMap.set(familyId, { label: family?.description ?? '', items: [] })
    }
    familyMap.get(familyId)!.items.push(entry)
  }

  const byName = (a: string, b: string) => a.localeCompare(b, 'pt-BR')
  const byDesc = (a: TPrintItem, b: TPrintItem) =>
    byName(a.description, b.description)

  const sorted = [...familyMap.values()]
    .sort((a, b) => byName(a.label, b.label))
    .map((g) => ({ ...g, items: [...g.items].sort(byDesc) }))

  if (uncategorized.length > 0) {
    sorted.push({
      label: 'Sem categoria',
      items: [...uncategorized].sort(byDesc)
    })
  }

  return sorted
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const buildHtml = (quote: TQuote, groups: TPrintGroup[]): string => {
  const date = formatDate(quote.date)
  const totalItems = quote.items.length

  const groupsHtml = groups
    .map(
      (g) => `
    <div class="group">
      <div class="group-header">${esc(g.label)}</div>
      <table>
        <thead>
          <tr>
            <th class="col-item">Item</th>
            <th class="col-ref">Referência</th>
            <th class="col-notes">Anotações</th>
          </tr>
        </thead>
        <tbody>
          ${g.items
            .map(
              (item) => `
          <tr>
            <td class="col-item"><span class="item-desc">${esc(item.description)}</span></td>
            <td class="col-ref">${
              item.refType
                ? `<span class="badge badge-${item.refType}">${item.refType === 'product' ? 'Produto' : 'Família'}</span>${esc(item.refLabel)}`
                : ''
            }</td>
            <td class="col-notes"></td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Cotação — ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
    .page-header { padding-bottom: 8px; border-bottom: 2px solid #111; margin-bottom: 14px; }
    .page-header h1 { font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; }
    .page-header p { font-size: 10px; color: #666; margin-top: 3px; }
    .group { margin-bottom: 16px; page-break-inside: avoid; }
    .group-header {
      font-size: 10px; font-weight: bold; text-transform: uppercase;
      letter-spacing: 0.08em; color: #333; background: #efefef;
      padding: 3px 8px; border-left: 3px solid #555; margin-bottom: 0;
    }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      font-size: 9px; font-weight: bold; text-transform: uppercase;
      letter-spacing: 0.06em; color: #888; padding: 3px 8px;
      border-bottom: 1px solid #ddd; text-align: left;
    }
    tbody tr { border-bottom: 1px solid #e8e8e8; }
    tbody tr:last-child { border-bottom: 1px solid #bbb; }
    td { padding: 8px 8px; vertical-align: middle; }
    .col-item { width: 38%; }
    .col-ref { width: 37%; }
    .col-notes { width: 25%; border-left: 1px dotted #ccc; }
    .item-desc { font-weight: 600; }
    .badge {
      display: inline-block; font-size: 8px; font-weight: bold;
      text-transform: uppercase; padding: 1px 4px; border-radius: 2px;
      margin-right: 4px; vertical-align: middle;
    }
    .badge-product { background: #dbeafe; color: #1e40af; }
    .badge-family { background: #ede9fe; color: #5b21b6; }
    @page { size: A4 portrait; margin: 14mm 12mm; }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>Cotação — ${date}</h1>
    <p>${totalItems} ${totalItems === 1 ? 'item' : 'itens'} · ${groups.length} ${groups.length === 1 ? 'categoria' : 'categorias'}</p>
  </div>
  ${groupsHtml}
</body>
</html>`
}

export const printQuote = (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[]
) => {
  const groups = buildGroups(quote, products, families)
  const html = buildHtml(quote, groups)

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
}
