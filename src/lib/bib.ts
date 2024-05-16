export const parseKeywords = (keywords: string[]) => {
  return keywords.map((kvPair) => {
    if (!kvPair.includes(':')) return { key: kvPair, value: kvPair }
    const [key, value] = kvPair.split(':')
    return { key, value }
  })
}
