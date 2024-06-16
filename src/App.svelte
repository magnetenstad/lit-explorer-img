<script lang="ts">
  import Authors from '$lib/authors.svelte'
  import {
    allBibEntries,
    authorEntries,
    dataTableEntries,
    nameEntries,
    setVisEntries,
    timelineEntries,
  } from '$lib/bib-store'
  import BibTable from '$lib/bib-table.svelte'
  import * as Resizable from '$lib/components/ui/resizable'
  import { Toaster } from '$lib/components/ui/sonner'
  import Names from '$lib/names.svelte'
  import SetVis from '$lib/set-vis.svelte'
  import Timeline from '$lib/timeline.svelte'
  import type { Entry, Library } from '@retorquere/bibtex-parser'
  import { parse } from '@retorquere/bibtex-parser'
  import { onDestroy, onMount } from 'svelte'
  import './app.css'

  let bib: Library | null = null
  onMount(async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}references.bib`)
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
  let unwrappedNameEntries: Entry[] = []
  const unsubName = nameEntries.subscribe((e) => (unwrappedNameEntries = e))

  let unwrappedAllEntries: Entry[] = []
  const unsubAllEntries = allBibEntries.subscribe(
    (e) => (unwrappedAllEntries = e)
  )

  onDestroy(() => {
    unsubTimeline()
    unsubSetVis()
    unsubAuthor()
    unsubName()
    unsubAllEntries()
  })
</script>

<main>
  <Toaster />
  {#if bib}
    <Resizable.PaneGroup direction="horizontal" class="h-[100svh]">
      <Resizable.Pane>
        <div class="flex flex-col max-h-[100svh] overflow-auto px-4">
          <div class="flex justify-between items-end">
            <span class="prose m-3">
              <h2>LitExplorer</h2>
            </span>
          </div>

          <span class="prose">
            <h3>Timeline</h3>
          </span>
          <Timeline bibEntries={unwrappedTimelineEntries}></Timeline>

          <span class="prose my-5">
            <h3>Categories</h3>
          </span>
          <div class="flex-1">
            <SetVis
              allBibEntries={unwrappedAllEntries}
              filteredBibEntries={unwrappedSetVisEntries}
            ></SetVis>
          </div>

          <span class="prose m-3">
            <h3>Authors</h3>
          </span>
          <div class="flex-1">
            <Authors bibEntries={unwrappedAuthorEntries}></Authors>
          </div>

          <span class="prose m-3">
            <h3>Names</h3>
          </span>
          <div class="flex-1">
            <Names bibEntries={unwrappedNameEntries}></Names>
          </div>
        </div>
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane>
        <div class="px-4">
          <BibTable bibEntries={dataTableEntries}></BibTable>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  {/if}
</main>

<style>
</style>
