<script lang="ts">
  import { type Entry } from '@retorquere/bibtex-parser'
  import X from 'lucide-svelte/icons/x'
  import { getEntryYear, yearFilter } from './bib-store'
  import { red500, slate200, slate400 } from './colors'
  import Button from './components/ui/button/button.svelte'

  export let bibEntries: Entry[]

  const extractYears = (bibEntries: Entry[]) => {
    const entriesPerYear = new Map<number, number>()
    bibEntries.forEach((entry) => {
      const year = getEntryYear(entry)
      if (!year) return
      if (entriesPerYear.has(year)) {
        entriesPerYear.set(year, (entriesPerYear.get(year) ?? 0) + 1)
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

  let hoverYear: number | null = null
  let startSelectYear: number | null = null
  let endSelectYear: number | null = null
  let selectedYears = new Set<number>()
  let mouseDown = false

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
    hoverYear: number | null,
    startSelectYear: number | null,
    endSelectYear: number | null,
    selectedYears: Set<number>
  ) => {
    const getColor = (year: number) => {
      if (
        startSelectYear &&
        endSelectYear &&
        Math.min(startSelectYear, endSelectYear) <= year &&
        year <= Math.max(startSelectYear, endSelectYear)
      ) {
        return slate400
      }
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

  function numberRange(start: number, end: number) {
    return new Array(end - start).fill(0).map((_, i) => i + start)
  }

  $: years = extractYears(bibEntries)
  $: maxEntriesInAYear = Math.max(...years.map((x) => x[1]))
  $: yearColors = getYearColors(
    years,
    hoverYear,
    startSelectYear,
    endSelectYear,
    selectedYears
  )
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
      }}><X size="20" />Clear Timeline</Button
    >
  {/if}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="flex flex-row rounded-md border items-stretch relative"
    on:mouseup={() => {
      if (startSelectYear && endSelectYear) {
        numberRange(
          Math.min(startSelectYear, endSelectYear),
          Math.max(startSelectYear, endSelectYear) + 1
        ).forEach((year) => toggleYear(year))
      }
      startSelectYear = null
      endSelectYear = null
      mouseDown = false
    }}
    on:mouseleave={() => {
      startSelectYear = null
      endSelectYear = null
      mouseDown = false
    }}
  >
    {#each years as [year, entries]}
      <button
        class="flex-1 relative"
        style="height: 100px"
        on:mouseenter={() => {
          hoverYear = year
          if (mouseDown) endSelectYear = year
        }}
        on:mousedown={() => {
          startSelectYear = year
          endSelectYear = year
          mouseDown = true
        }}
        on:mouseleave={() => (hoverYear = null)}
        on:focus={() => (hoverYear = year)}
      >
        <div
          class="absolute bottom-0"
          style={`height: ${(100 * entries) / maxEntriesInAYear}px; width: 100%; background-color: ${yearColors.get(year)}; border-left: 1px solid ${slate400};`}
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
