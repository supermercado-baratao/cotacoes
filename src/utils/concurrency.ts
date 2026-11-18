export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size))
  }
  return chunks
}

// Roda `mapper` sobre `items` com no máximo `limit` chamadas em voo ao mesmo
// tempo — usado nas queries "in" em chunks (ver database.ts, models/invoice,
// models/order), onde um catálogo grande gera centenas de chunks e disparar
// todos de uma vez satura a conexão com o Firestore (emulador trava, stream
// WebChannel derruba).
export const mapWithConcurrencyLimit = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = []
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await mapper(items[index])
      }
    })
  )
  return results
}
