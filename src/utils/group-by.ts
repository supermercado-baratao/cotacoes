// Map.groupBy needs Chrome 117 / Safari 17.4, above Vite's default build target.
export const groupBy = <T, K>(
  items: T[],
  getKey: (item: T) => K
): Map<K, T[]> => {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const key = getKey(item)
    const group = groups.get(key)
    if (group) group.push(item)
    else groups.set(key, [item])
  }
  return groups
}
