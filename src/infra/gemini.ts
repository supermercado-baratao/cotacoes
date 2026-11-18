import type { TFamily } from '@/models/family/types'
import type { TProduct } from '@/models/product/types'
import type { TQuoteItem } from '@/models/quote/types'

import { suggestPriceReferencesLocally } from './gemini-fallback'

// Fora do Vite (ex: seed de dados do Playwright rodando em Node puro),
// import.meta.env não é populado — cai pra process.env nesse caso.
const env = import.meta.env ?? process.env

const API_KEY = env.VITE_GEMINI_API_KEY as string
const MODEL = env.VITE_GEMINI_MODEL as string
const DEV_SIMULATED_DELAY_MS = 30_000

export type TAiSuggestion = {
  itemId: string
  type: 'product' | 'family' | null
  id: string | null
}

export type TSuggestPriceReferencesResult = {
  suggestions: TAiSuggestion[]
  /** true quando a IA não pôde ser usada e as sugestões vieram da correspondência local */
  isFallback: boolean
}

export const suggestPriceReferences = async (
  items: TQuoteItem[],
  products: TProduct[],
  families: TFamily[]
): Promise<TSuggestPriceReferencesResult> => {
  if (env.MODE !== 'production') {
    if (env.MODE !== 'test') {
      await new Promise((resolve) =>
        setTimeout(resolve, DEV_SIMULATED_DELAY_MS)
      )
    }
    return {
      suggestions: suggestPriceReferencesLocally(items, products, families),
      isFallback: true
    }
  }

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
  const itemList = items
    .map((item) => `id=${item.id} | ${item.description}`)
    .join('\n')

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

  try {
    const response = await fetch(url, {
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

    if (!response.ok) {
      throw new Error(`Gemini error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const raw: unknown = JSON.parse(data.candidates[0].content.parts[0].text)
    return { suggestions: raw as TAiSuggestion[], isFallback: false }
  } catch (error) {
    console.error(
      'Falha ao consultar a IA do Gemini. Usando sugestões locais como alternativa.',
      error
    )
    return {
      suggestions: suggestPriceReferencesLocally(items, products, families),
      isFallback: true
    }
  }
}
