<script lang="ts">
  import Authors from '$lib/authors.svelte'
  import BibTable from '$lib/bib-table.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import SetVis from '$lib/set-vis.svelte'
  import Timeline from '$lib/timeline.svelte'
  import type { Library } from '@retorquere/bibtex-parser'
  import { parse } from '@retorquere/bibtex-parser'
  import { onMount } from 'svelte'
  import './app.css'

  let bib: Library | null = null
  onMount(async () => {
    const response = await fetch('/survis2/references.bib')
    const file = await response.text()
    bib = parse(file)
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
        <Timeline {bib}></Timeline>
        <div class="prose m-3">
          <h3>Categories</h3>
        </div>
        <div class="flex-1">
          <SetVis {bib}></SetVis>
        </div>
        <div class="prose m-3">
          <h3>Authors</h3>
        </div>
        <div class="flex-1">
          <Authors {bib}></Authors>
        </div>
      </div>
      <div class="flex-1">
        <BibTable {bib}></BibTable>
      </div>
    </div>
  {/if}
</main>

<style>
</style>
