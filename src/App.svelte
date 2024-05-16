<script lang="ts">
  import BibTable from '$lib/bib-table.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import './app.css'
</script>

<main>
  <div class="row" style="max-height: 100svh; overflow: auto">
    <div style="max-width: 1200px; margin: auto">
      <div class="prose my-3">
        <h2>SurVis2</h2>
      </div>
      <div>
        <BibTable></BibTable>
      </div>
    </div>
  </div>
  <Toaster />
</main>

<style>
</style>
