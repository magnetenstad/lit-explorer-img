<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js'
  import { type Entry } from '@retorquere/bibtex-parser'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import { onDestroy } from 'svelte'
  import { authorFilter, authorToString } from './bib-store'

  export let bibEntries: Entry[]

  const extractAuthors = (bibEntries: Entry[]) => {
    const authorCounts = new Map()
    bibEntries.forEach((entry) => {
      entry.fields.author?.forEach((author) => {
        const key = authorToString(author)
        if (authorCounts.has(key)) {
          authorCounts.set(key, authorCounts.get(key) + 1)
        } else {
          authorCounts.set(key, 1)
        }
      })
    })
    return [...authorCounts.entries()].toSorted((a, b) => b[1] - a[1])
  }

  $: authors = extractAuthors(bibEntries)
  $: firstAuthors = authors.slice(0, 20)
  $: laterAuthors = authors.slice(20)

  let unwrappedAuthorFilter = new Set<string>()
  const unsubAuthor = authorFilter.subscribe((e) => (unwrappedAuthorFilter = e))
  onDestroy(() => {
    unsubAuthor()
  })
</script>

<div class="relative">
  {#if unwrappedAuthorFilter.size}
    <Button
      class="absolute right-0 transform translate-y-[-45px]"
      variant="outline"
      on:click={() => {
        authorFilter.set(new Set())
      }}>Clear</Button
    >
  {/if}
  <ToggleGroup.Root
    type="multiple"
    value={[...unwrappedAuthorFilter]}
    onValueChange={(authors) => {
      authorFilter.set(new Set(authors))
    }}
  >
    <Collapsible.Root>
      <div class="flex flex-wrap space-x-1 space-y-1">
        {#each firstAuthors as author}
          <ToggleGroup.Item value={author[0]}>
            <span class="text-nowrap">{author[0]} {author[1]}</span>
          </ToggleGroup.Item>
        {/each}

        <Collapsible.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="ghost"
            size="sm"
            class="w-9 p-0"
          >
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
</div>
