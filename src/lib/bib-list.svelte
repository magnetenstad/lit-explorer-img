<script lang="ts">
  import type { Library } from '@retorquere/bibtex-parser'
  import { parse } from '@retorquere/bibtex-parser'
  import { onMount } from 'svelte'

  let bib: Library | null = null

  onMount(async () => {
    const response = await fetch('/survis2/references.bib')
    const file = await response.text()
    bib = parse(file)
  })
</script>

<div class="col">
  {#if bib}
    <h4>{bib.entries.length} Publications</h4>
    {#each bib.entries as entry}
      <div class="bib-card">
        <h4>
          {entry.fields.title}
          <a href={'https://doi.org/' + entry.fields['doi']}>doi</a>
        </h4>
        <p>
          By
          {#each entry.fields.author ?? [] as author}
            <span>{`${author.firstName} ${author.lastName}, `}</span>
          {/each}
        </p>
      </div>
    {/each}
  {/if}
</div>

<style scoped>
  .bib-card {
    padding: 0.5em;
    margin: 0.5em;
    border: 1px solid black;
    border-radius: 6px;
  }

  h4 {
    margin: 0;
  }
</style>
