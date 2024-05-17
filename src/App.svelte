<script lang="ts">
  import Authors from '$lib/authors.svelte'
  import {
    allBibEntries,
    authorEntries,
    dataTableEntries,
    setVisEntries,
    timelineEntries,
  } from '$lib/bib-store'
  import BibTable from '$lib/bib-table.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import SetVis from '$lib/set-vis.svelte'
  import Timeline from '$lib/timeline.svelte'
  import type { Entry, Library } from '@retorquere/bibtex-parser'
  import { parse } from '@retorquere/bibtex-parser'
  import { onDestroy, onMount } from 'svelte'
  import './app.css'

  let bib: Library | null = null
  onMount(async () => {
    const response = await fetch('/survis2/references.bib')
    const file = await response.text()
    bib = parse(file)
    allBibEntries.set(bib.entries)
  })

  let unwrappedTimelineEntries: Entry[] = []
  const unsubTimeline = timelineEntries.subscribe(
    (e) => (unwrappedTimelineEntries = e)
  )
  let unwrappedSetVisEntries: Entry[] = []
  const unsubSetVis = setVisEntries.subscribe(
    (e) => (unwrappedSetVisEntries = e)
  )
  let unwrappedAuthorEntries: Entry[] = []
  const unsubAuthor = authorEntries.subscribe(
    (e) => (unwrappedAuthorEntries = e)
  )
  let unwrappedAllEntries: Entry[] = []
  const unsubAllEntries = allBibEntries.subscribe(
    (e) => (unwrappedAllEntries = e)
  )

  onDestroy(() => {
    unsubTimeline()
    unsubSetVis()
    unsubAuthor()
    unsubAllEntries()
  })
</script>

<main>
  <Toaster />
  {#if bib}
    <div class="flex gap-[1em] mx-[1em]">
      <div class="flex flex-col flex-1 max-h-[100svh] overflow-auto">
        <div class="prose m-3">
          <h2>SurVis2</h2>
        </div>
        <div class="prose m-3">
          <h3>Timeline</h3>
        </div>
        <Timeline bibEntries={unwrappedTimelineEntries}></Timeline>
        <div class="prose m-3">
          <h3>Categories</h3>
        </div>
        <div class="flex-1">
          <SetVis
            allBibEntries={unwrappedAllEntries}
            filteredBibEntries={unwrappedSetVisEntries}
          ></SetVis>
        </div>
        <div class="prose m-3">
          <h3>Authors</h3>
        </div>
        <div class="flex-1">
          <Authors bibEntries={unwrappedAuthorEntries}></Authors>
        </div>
      </div>
      <div class="flex-1">
        <BibTable bibEntries={dataTableEntries}></BibTable>
      </div>
    </div>
  {/if}
</main>

<style>
</style>
