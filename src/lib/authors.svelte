<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js'
  import { type Library } from '@retorquere/bibtex-parser'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'

  export let bib: Library

  const extractAuthors = (bib: Library) => {
    const authorCounts = new Map()
    bib.entries.forEach((entry) => {
      entry.fields.author?.forEach((author) => {
        const key = `${author.firstName} ${author.lastName}`
        if (authorCounts.has(key)) {
          authorCounts.set(key, authorCounts.get(key) + 1)
        } else {
          authorCounts.set(key, 1)
        }
      })
    })
    return [...authorCounts.entries()].toSorted((a, b) => b[1] - a[1])
  }

  $: authors = extractAuthors(bib)
  $: firstAuthors = authors.slice(0, 20)
  $: laterAuthors = authors.slice(20)
</script>

<ToggleGroup.Root type="multiple">
  <Collapsible.Root>
    <div class="flex flex-wrap space-x-1 space-y-1">
      {#each firstAuthors as author}
        <ToggleGroup.Item value={author[0]}>
          <span class="text-nowrap">{author[0]} {author[1]}</span>
        </ToggleGroup.Item>
      {/each}

      <Collapsible.Trigger asChild let:builder>
        <Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0">
          <ChevronsUpDown class="h-4 w-4" />
          <span class="sr-only">Toggle</span>
        </Button>
      </Collapsible.Trigger>
    </div>
    <Collapsible.Content class="space-x-1 space-y-1">
      {#each laterAuthors as author}
        <ToggleGroup.Item value={author[0]}>
          <span class="text-nowrap">{author[0]} {author[1]}</span>
        </ToggleGroup.Item>
      {/each}
    </Collapsible.Content>
  </Collapsible.Root>
</ToggleGroup.Root>
