import type { Creator, Entry } from '@retorquere/bibtex-parser'
import { get, writable } from 'svelte/store'

export const allBibEntries = writable<Entry[]>([])

export const dataTableEntries = writable<Entry[]>([])
export const timelineEntries = writable<Entry[]>([])
export const authorEntries = writable<Entry[]>([])
export const setVisEntries = writable<Entry[]>([])
export const nameEntries = writable<Entry[]>([])

export const setVisFilter = writable(new Set<string>())
export const yearFilter = writable(new Set<number>())
export const authorFilter = writable(new Set<string>())
export const nameFilter = writable(new Set<string>())

export const dialogEntry = writable<Entry | undefined>(undefined)

export enum Filter {
  Year,
  SetVis,
  Author,
  Name,
}

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

const filterByName = (entries: Entry[]) => {
  const unwrappedNameFilter = get(nameFilter)
  if (unwrappedNameFilter.size) {
    entries = entries.filter((e) => unwrappedNameFilter.has(e.fields.name))
  }
  return entries
}

const filterAll = (entries: Entry[], except?: Filter) => {
  if (except != Filter.Year) {
    entries = filterByYear(entries)
  }
  if (except != Filter.Author) {
    entries = filterByAuthor(entries)
  }
  if (except != Filter.SetVis) {
    entries = filterBySetVis(entries)
  }
  if (except != Filter.Name) {
    entries = filterByName(entries)
  }
  return entries
}

const updateSets = (except?: Filter) => {
  const entries = get(allBibEntries)
  dataTableEntries.set(filterAll(entries))

  if (except != Filter.Year) {
    timelineEntries.set(filterAll(entries, Filter.Year))
  }
  if (except != Filter.Author) {
    authorEntries.set(filterAll(entries, Filter.Author))
  }
  if (except != Filter.SetVis) {
    setVisEntries.set(filterAll(entries, Filter.SetVis))
  }
  if (except != Filter.Name) {
    nameEntries.set(filterAll(entries, Filter.Name))
  }
}

allBibEntries.subscribe(() => {
  updateSets()
})
setVisFilter.subscribe(() => {
  updateSets(Filter.SetVis)
})
yearFilter.subscribe(() => {
  updateSets(Filter.Year)
})
authorFilter.subscribe(() => {
  updateSets(Filter.Author)
})
nameFilter.subscribe(() => {
  updateSets(Filter.Name)
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
