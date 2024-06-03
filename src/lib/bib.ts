import type { Entry } from '@retorquere/bibtex-parser'

export const parseCategories = (entry: Entry) => {
  if (!entry.fields.categories) return []
  return entry.fields.categories
    .split(',')
    .map((c) => c.trim())
    .toSorted()
}
