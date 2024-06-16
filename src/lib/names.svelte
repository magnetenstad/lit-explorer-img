<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js'
  import { type Entry } from '@retorquere/bibtex-parser'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import { onDestroy } from 'svelte'
  import { nameFilter } from './bib-store'

  export let bibEntries: Entry[]

  const extractNames = (bibEntries: Entry[]) => {
    const nameCounts = new Map()
    bibEntries.forEach((entry) => {
      const name = entry.fields.name
      if (!name) return
      if (nameCounts.has(name)) {
        nameCounts.set(name, nameCounts.get(name) + 1)
      } else {
        nameCounts.set(name, 1)
      }
    })
    return [...nameCounts.entries()].toSorted((a, b) => b[1] - a[1])
  }

  $: names = extractNames(bibEntries)
  $: namesFirstSlice = names.slice(0, 20)
  $: namesLastSlice = names.slice(20)

  let unwrappedNameFilter = new Set<string>()
  const unsubNames = nameFilter.subscribe((e) => (unwrappedNameFilter = e))
  onDestroy(() => {
    unsubNames()
  })
</script>

<div class="relative">
  {#if unwrappedNameFilter.size}
    <Button
      class="absolute right-0 transform translate-y-[-45px]"
      variant="outline"
      on:click={() => {
        nameFilter.set(new Set())
      }}>Clear</Button
    >
  {/if}
  <ToggleGroup.Root
    type="multiple"
    value={[...unwrappedNameFilter]}
    onValueChange={(names) => {
      nameFilter.set(new Set(names))
    }}
  >
    <Collapsible.Root>
      <div class="flex flex-wrap space-x-1 space-y-1">
        {#each namesFirstSlice as name}
          <ToggleGroup.Item value={name[0]}>
            <span class="text-nowrap">{name[0]} {name[1]}</span>
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
        {#each namesLastSlice as name}
          <ToggleGroup.Item value={name[0]}>
            <span class="text-nowrap">{name[0]} {name[1]}</span>
          </ToggleGroup.Item>
        {/each}
      </Collapsible.Content>
    </Collapsible.Root>
  </ToggleGroup.Root>
</div>
