<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import type { Creator, Entry } from '@retorquere/bibtex-parser'
  import { onDestroy } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { parseCategories } from './bib'
  import { dialogEntry, lockedEntries } from './bib-store'
  import BibTableImg from './bib-table-img.svelte'
  import { Button } from './components/ui/button'

  const authorsToStringVerbose = (authors: Creator[]) => {
    if (authors.length == 0) {
      return 'Unknown'
    }
    return (
      authors.reduce(
        (prev: string, curr) =>
          prev +
          (prev.length ? ' and ' : '') +
          `${curr.firstName ?? ''} ${curr.lastName ?? ''}`,
        ''
      ) + '.'
    )
  }

  let unwrappedDialogEntry = undefined as Entry | undefined
  let unwrappedLockedEntries = new Set<string>()
  let dialogOpen = false

  const unsubDialogEntry = dialogEntry.subscribe((entry) => {
    unwrappedDialogEntry = entry
    dialogOpen = !!entry
  })
  const unsubLockedEntries = lockedEntries.subscribe(
    (entries) => (unwrappedLockedEntries = entries)
  )

  onDestroy(() => {
    unsubDialogEntry()
    unsubLockedEntries()
  })

  const resetDialogEntry = (open: boolean) => {
    if (!open) {
      dialogEntry.set(undefined)
    }
  }
  $: resetDialogEntry(dialogOpen)
</script>

<Dialog.Root bind:open={dialogOpen}>
  {#if unwrappedDialogEntry}
    <Dialog.Content class="max-w-[80svw] max-h-[90svh]">
      <Dialog.Header>
        <Dialog.Title>{unwrappedDialogEntry.fields.title}</Dialog.Title>
        <Dialog.Description
          >{authorsToStringVerbose(
            unwrappedDialogEntry.fields.author ?? []
          )}</Dialog.Description
        >
      </Dialog.Header>

      <div class="flex gap-3 items-start">
        <div class="flex-1 prose max-h-[80svh] overflow-auto">
          <p>
            {parseCategories(unwrappedDialogEntry).join(', ')}, {unwrappedDialogEntry
              .fields.date ?? ''}
          </p>
          <p>
            {unwrappedDialogEntry.fields.abstract ?? ''}
          </p>
          <details>
            <summary>
              <h4>BibTex</h4>
            </summary>
            <pre
              style="white-space: pre; overflow-x: hidden;">{unwrappedDialogEntry.input}</pre>
          </details>
        </div>

        <div class="flex-1 max-h-[80svh] flex flex-col justify-between gap-3">
          <div class="overflow-auto">
            <BibTableImg
              bibKey={unwrappedDialogEntry.key}
              className="rounded-md border"
              width=""
              dir="raw"
            ></BibTableImg>
          </div>

          <div class="flex justify-end gap-3">
            <Button
              disabled={unwrappedLockedEntries.has(unwrappedDialogEntry.key)}
              on:click={() => {
                lockedEntries.update((entries) => {
                  if (unwrappedDialogEntry) {
                    entries.add(unwrappedDialogEntry.key)
                  }
                  return entries
                })
              }}
            >
              Add to Collection
            </Button>
            <Button
              on:click={() => {
                if (!unwrappedDialogEntry?.fields.doi?.length) return
                window.location.href = `https://doi.org/${unwrappedDialogEntry.fields.doi}`
              }}
            >
              Visit Page
            </Button>
            <Button
              on:click={() => {
                if (!unwrappedDialogEntry) return
                navigator.clipboard.writeText(unwrappedDialogEntry.input)
                toast.success('BibTex has been copied', {
                  description: unwrappedDialogEntry.fields.title,
                })
              }}
            >
              Copy BibTex
            </Button>
          </div>
        </div>
      </div>
    </Dialog.Content>
  {/if}
</Dialog.Root>
