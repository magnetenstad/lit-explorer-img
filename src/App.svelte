<script lang="ts">
  import BibTable from '$lib/bib-table.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import * as Tabs from '$lib/components/ui/tabs'
  import SetVis from '$lib/set-vis.svelte'
  import './app.css'
</script>

<main>
  <Toaster />
  <div class="row" style="max-height: 100svh; overflow: auto">
    <div style="max-width: 1200px; margin: auto">
      <div class="prose my-3">
        <h2>SurVis2</h2>
      </div>
      <Tabs.Root value="table">
        <Tabs.List>
          <Tabs.Trigger value="table">Table</Tabs.Trigger>
          <Tabs.Trigger value="visualization">Visualization</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="table">
          <BibTable></BibTable>
        </Tabs.Content>
        <Tabs.Content value="visualization">
          <SetVis></SetVis>
        </Tabs.Content>
      </Tabs.Root>
      <div></div>
    </div>
  </div>
</main>

<style>
</style>
