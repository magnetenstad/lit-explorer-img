<script lang="ts">
  import { type Entry } from '@retorquere/bibtex-parser'
  import X from 'lucide-svelte/icons/x'
  import { getEntryYear, yearFilter } from './bib-store'
  import { red500, slate300, slate600 } from './colors'
  import Button from './components/ui/button/button.svelte'

  export let allBibEntries: Entry[]
  export let bibEntries: Entry[]

  const extractYears = (bibEntries: Entry[], addGap = false) => {
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
    if (addGap) {
      ;[...entriesPerYear.keys()].forEach((year) => {
        if (!entriesPerYear.has(year - 1)) {
          entriesPerYear.set(year - 1, 0)
        }
      })
    }
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

  const getYearStyles = (
    years: [number, number][],
    selectableYears: Set<number>,
    hoverYear: number | null,
    startSelectYear: number | null,
    endSelectYear: number | null,
    selectedYears: Set<number>
  ) => {
    const getStyle = (year: number) => {
      const fill = selectableYears.has(year) ? slate300 : 'white'
      const isHovered =
        year == hoverYear ||
        (startSelectYear &&
          endSelectYear &&
          Math.min(startSelectYear, endSelectYear) <= year &&
          year <= Math.max(startSelectYear, endSelectYear))
      const stroke = isHovered ? red500 : slate600
      const strokeWidth = selectedYears.has(year) || isHovered ? '2px' : '1px'
      return { fill, stroke, strokeWidth }
    }
    const yearStyles = new Map<
      number,
      { fill: string; stroke: string; strokeWidth: string }
    >()
    years.forEach(([year, _]) => {
      yearStyles.set(year, getStyle(year))
    })
    return yearStyles
  }

  function numberRange(start: number, end: number) {
    return new Array(end - start).fill(0).map((_, i) => i + start)
  }

  $: years = extractYears(allBibEntries, true)
  $: selectableYears = new Set(
    extractYears(bibEntries, false).map(([a, b]) => a)
  )
  $: maxEntriesInAYear = Math.max(...years.map((x) => x[1]))
  $: yearStyles = getYearStyles(
    years,
    selectableYears,
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
          class="absolute bottom-0 w-[100%] rounded-t"
          style={`height: ${(100 * entries) / maxEntriesInAYear}px; background-color: ${yearStyles.get(year)?.fill}; outline: ${entries == 0 ? 'undefined' : `${yearStyles.get(year)?.strokeWidth} solid ${yearStyles.get(year)?.stroke}`}`}
        ></div>
        {#if year == hoverYear}
          <div class="absolute top-0 right-0">
            <span style={`color: ${red500}`}>{year}</span>
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
