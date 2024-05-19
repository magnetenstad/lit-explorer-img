import type { Creator, Entry } from '@retorquere/bibtex-parser'
import { get, writable } from 'svelte/store'

export const allBibEntries = writable<Entry[]>([])

export const dataTableEntries = writable<Entry[]>([])
export const timelineEntries = writable<Entry[]>([])
export const authorEntries = writable<Entry[]>([])
export const setVisEntries = writable<Entry[]>([])

export const setVisFilter = writable(new Set<string>())
export const yearFilter = writable(new Set<number>())
export const authorFilter = writable(new Set<string>())

const filterByYear = (entries: Entry[]) => {
  const unwrappedYearFilter = get(yearFilter)
  if (unwrappedYearFilter.size) {
    entries = entries.filter((e) => {
      const year = getEntryYear(e)
      if (!year) {
        return false
      }
      return unwrappedYearFilter.has(year)
    })
  }
  return entries
}

const filterBySetVis = (entries: Entry[]) => {
  const unwrappedBibKeyFilter = get(setVisFilter)
  if (unwrappedBibKeyFilter.size) {
    entries = entries.filter((e) => unwrappedBibKeyFilter.has(e.key))
  }
  return entries
}

const filterByAuthor = (entries: Entry[]) => {
  const unwrappedAuthorFilter = get(authorFilter)
  if (unwrappedAuthorFilter.size) {
    entries = entries.filter((e) =>
      e.fields.author?.some((a) => unwrappedAuthorFilter.has(authorToString(a)))
    )
  }
  return entries
}

allBibEntries.subscribe((entries) => {
  // Update all
  dataTableEntries.set(filterByAuthor(filterBySetVis(filterByYear(entries))))
  timelineEntries.set(filterByAuthor(filterBySetVis(entries)))
  authorEntries.set(filterBySetVis(filterByYear(entries)))
  setVisEntries.set(filterByAuthor(filterByYear(entries)))
})
setVisFilter.subscribe(() => {
  // Update all except SetVis
  const entries = get(allBibEntries)
  dataTableEntries.set(filterByAuthor(filterBySetVis(filterByYear(entries))))
  timelineEntries.set(filterByAuthor(filterBySetVis(entries)))
  authorEntries.set(filterBySetVis(filterByYear(entries)))
})
yearFilter.subscribe(() => {
  // Update all except Timeline
  const entries = get(allBibEntries)
  dataTableEntries.set(filterByAuthor(filterBySetVis(filterByYear(entries))))
  authorEntries.set(filterBySetVis(filterByYear(entries)))
  setVisEntries.set(filterByAuthor(filterByYear(entries)))
})
authorFilter.subscribe(() => {
  // Update all except Author
  const entries = get(allBibEntries)
  dataTableEntries.set(filterByAuthor(filterBySetVis(filterByYear(entries))))
  timelineEntries.set(filterByAuthor(filterBySetVis(entries)))
  setVisEntries.set(filterByAuthor(filterByYear(entries)))
})

export const authorToString = (author: Creator) => {
  return `${author.firstName} ${author.lastName}`
}

export const getEntryYear = (entry: Entry) => {
  const dateString = entry.fields.date ?? entry.fields.year
  try {
    return new Date(dateString).getFullYear()
  } catch {
    return undefined
  }
}
