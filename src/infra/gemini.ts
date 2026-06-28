import type { TFamily, TProduct, TQuoteItem } from '@/models'

import { mockSuggestPriceReferences } from '../tests/_mocks/gemini'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const MODEL = import.meta.env.VITE_GEMINI_MODEL as string

export type TAiSuggestion = {
  itemId: string
  type: 'product' | 'family' | null
  id: string | null
}

export const suggestPriceReferences = async (
  items: TQuoteItem[],
  products: TProduct[],
  families: TFamily[]
): Promise<TAiSuggestion[]> => {
  if (import.meta.env.MODE !== 'production') {
    return mockSuggestPriceReferences(items, products, families)
  }

  console.log('================\npassou\n=================')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

  const productList = products
    .map((p) => {
      const family = families.find((f) => f.id === p.familyId)
      return `id=${p.id} | ${p.description}${family ? ` (família: ${family.description})` : ''}`
    })
    .join('\n')

  const familyList = families
    .map((f) => `id=${f.id} | ${f.description}`)
    .join('\n')
  const itemList = items.map((i) => `id=${i.id} | ${i.description}`).join('\n')

  const prompt = `Você é um assistente especializado em supermercados. Seu trabalho é associar itens de cotação de fornecedor ao catálogo interno.

PRODUTOS DO CATÁLOGO:
${productList}

FAMÍLIAS DO CATÁLOGO:
${familyList}

ITENS DA COTAÇÃO A ASSOCIAR:
${itemList}

Para cada item da cotação, encontre a melhor correspondência no catálogo:
- Prefira sempre família quando o item se enquadra na categoria, pois o preço de família é mais representativo.
- Use produto específico apenas quando não há família correspondente no catálogo.
- Use type null e id null quando não há correspondência razoável.
Considere variações de grafia, abreviações e unidades (ex: "5KG", "1L", "CX", "PCT").`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemId: { type: 'string' },
              type: {
                type: 'string',
                enum: ['product', 'family'],
                nullable: true
              },
              id: { type: 'string', nullable: true }
            },
            required: ['itemId', 'type', 'id']
          }
        }
      }
    })
  })

  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${res.statusText}`)

  const data = await res.json()
  const raw: unknown = JSON.parse(data.candidates[0].content.parts[0].text)
  return raw as TAiSuggestion[]
}
