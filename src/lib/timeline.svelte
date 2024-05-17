<script lang="ts">
  import { type Entry } from '@retorquere/bibtex-parser'
  import { getEntryYear, yearFilter } from './bib-store'
  import { red500, slate200, slate400 } from './colors'
  import Button from './components/ui/button/button.svelte'

  export let bibEntries: Entry[]

  const extractYears = (bibEntries: Entry[]) => {
    const entriesPerYear = new Map()
    bibEntries.forEach((entry) => {
      const year = getEntryYear(entry)
      if (entriesPerYear.has(year)) {
        entriesPerYear.set(year, entriesPerYear.get(year) + 1)
      } else {
        entriesPerYear.set(year, 1)
      }
    })
    ;[...entriesPerYear.keys()].forEach((year) => {
      if (!entriesPerYear.has(year - 1)) {
        entriesPerYear.set(year - 1, 0)
      }
    })
    return [...entriesPerYear.entries()].toSorted((a, b) => a[0] - b[0])
  }

  let hoverYear = 0
  let selectedYears = new Set<number>()

  const toggleYear = (year: number) => {
    if (selectedYears.has(year)) {
      selectedYears.delete(year)
    } else {
      selectedYears.add(year)
    }
    selectedYears = selectedYears
    yearFilter.set(selectedYears)
  }

  const getYearColors = (
    years: [number, number][],
    hoverYear: number,
    selectedYears: Set<number>
  ) => {
    const getColor = (year: number) => {
      if (selectedYears.has(year)) {
        return red500
      }
      if (year == hoverYear) {
        return slate400
      }
      return slate200
    }
    const yearColors = new Map<number, string>()
    years.forEach(([year, _]) => {
      yearColors.set(year, getColor(year))
    })
    return yearColors
  }

  $: years = extractYears(bibEntries)
  $: maxEntriesPerYear = Math.max(...years.map((x) => x[1]))
  $: yearColors = getYearColors(years, hoverYear, selectedYears)
</script>

<div class="relative">
  {#if selectedYears.size}
    <Button
      class="absolute right-0 transform translate-y-[-45px]"
      variant="outline"
      on:click={() => {
        selectedYears.clear()
        yearFilter.set(new Set())
        selectedYears = selectedYears
      }}>Clear</Button
    >
  {/if}
  <div class="flex flex-row rounded-md border items-stretch relative">
    {#each years as [year, entries]}
      <button
        class="flex-1 relative"
        style="height: 100px"
        on:mouseover={() => (hoverYear = year)}
        on:mouseleave={() => (hoverYear = 0)}
        on:focus={() => (hoverYear = year)}
        on:click={() => toggleYear(year)}
      >
        <div
          class="absolute bottom-0"
          style={`height: ${(100 * entries) / maxEntriesPerYear}px; width: 100%; background-color: ${yearColors.get(year)}; border-left: 1px solid ${slate400};`}
        ></div>
        {#if year == hoverYear}
          <div class="absolute top-0 right-0">
            <span>{year}</span>
          </div>
        {/if}
      </button>
    {/each}
    <div class="absolute top-0 left-0">
      <span>{years.at(0)?.at(0)}</span>
    </div>
    <div class="absolute top-0 right-0">
      <span>{years.at(-1)?.at(0)}</span>
    </div>
  </div>
</div>
