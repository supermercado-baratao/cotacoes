export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

// Roda `fn` sobre `items` com no máximo `limit` chamadas em voo ao mesmo
// tempo — usado nas queries "in" em chunks (ver database.ts, invoice-model,
// order-model), onde um catálogo grande gera centenas de chunks e disparar
// todos de uma vez satura a conexão com o Firestore (emulador trava, stream
// WebChannel derruba).
export const mapWithConcurrencyLimit = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = new Array(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await fn(items[index])
      }
    })
  )
  return results
}
