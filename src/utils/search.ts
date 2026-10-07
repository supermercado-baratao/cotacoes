const normalize = (text: string) =>
  text.normalize('NFD').replaceAll(/[̀-ͯ]/g, '').toLowerCase()

export const matchesSearch = (
  query: string,
  ...fields: (string | null | undefined)[]
): boolean => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true
  const text = fields
    .filter((field) => field != null)
    .map(normalize)
    .join(' ')
  return tokens.every((token) => text.includes(token))
}
