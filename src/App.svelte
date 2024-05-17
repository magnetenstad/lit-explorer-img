<script lang="ts">
  import BibTable from '$lib/bib-table.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import SetVis from '$lib/set-vis.svelte'
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
      <div>
        <div class="prose m-3">
          <h2>SurVis2</h2>
        </div>
        <SetVis {bib}></SetVis>
      </div>
      <BibTable {bib}></BibTable>
    </div>
  {/if}
</main>

<style>
</style>
