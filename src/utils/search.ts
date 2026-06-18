const normalize = (str: string) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const matchesSearch = (
  query: string,
  ...fields: (string | null | undefined)[]
): boolean => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (!tokens.length) return true
  const text = fields.map((f) => normalize(f ?? '')).join(' ')
  return tokens.every((token) => text.includes(token))
}
