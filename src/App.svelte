<script lang="ts">
  import BibTable from '$lib/bib-table.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import * as Tabs from '$lib/components/ui/tabs'
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
  <div class="row" style="max-height: 100svh; overflow: auto">
    <div>
      <div class="prose my-3">
        <h2>SurVis2</h2>
      </div>
      <Tabs.Root value="both">
        <Tabs.List>
          <Tabs.Trigger value="both">Both</Tabs.Trigger>
          <Tabs.Trigger value="table">Table</Tabs.Trigger>
          <Tabs.Trigger value="visualization">Visualization</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="both">
          {#if bib}
            <div class="flex">
              <SetVis {bib}></SetVis>
              <div class="mh-100 overflow-auto">
                <BibTable {bib}></BibTable>
              </div>
            </div>
          {/if}
        </Tabs.Content>
        <Tabs.Content value="table">
          {#if bib}
            <BibTable {bib}></BibTable>
          {/if}
        </Tabs.Content>
        <Tabs.Content value="visualization">
          {#if bib}
            <!-- <SetVis {bib}></SetVis> -->
          {/if}
        </Tabs.Content>
      </Tabs.Root>
      <div></div>
    </div>
  </div>
</main>

<style>
</style>
