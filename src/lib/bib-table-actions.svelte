<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import type { Entry } from '@retorquere/bibtex-parser'
  import Ellipsis from 'lucide-svelte/icons/ellipsis'
  import { toast } from 'svelte-sonner'

  export let bibEntry: Entry

  const copyBibEntry = () => {
    navigator.clipboard.writeText(bibEntry.input)
    toast.success('BibTex has been copied', {
      description: bibEntry.fields.title,
    })
  }

  const goToDoi = () => {
    window.location.href = `https://doi.org/${bibEntry.fields.doi}`
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="ghost"
      builders={[builder]}
      size="icon"
      class="relative h-8 w-8 p-0"
    >
      <span class="sr-only">Open menu</span>
      <Ellipsis class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item on:click={copyBibEntry}>Copy BibTex</DropdownMenu.Item>

    {#if bibEntry.fields.doi}
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={goToDoi}>Visit page</DropdownMenu.Item>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
