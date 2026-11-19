export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size))
  }
  return chunks
}

// Used by the chunked "in" queries (database.ts, models/invoice, models/order):
// a large catalog yields hundreds of chunks, and firing them all at once
// saturates the Firestore connection (the emulator hangs, the WebChannel stream
// drops).
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
