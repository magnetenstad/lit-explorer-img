<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import type { Creator, Entry } from '@retorquere/bibtex-parser'
  import { onDestroy } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { parseCategories } from './bib'
  import { dialogEntry } from './bib-store'
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

  let hoverEntry = undefined as Entry | undefined
  let dialogOpen = false

  const unsub = dialogEntry.subscribe((entry) => {
    hoverEntry = entry
    dialogOpen = !!entry
  })
  onDestroy(() => {
    unsub()
  })
  const resetDialogEntry = (open: boolean) => {
    if (!open) {
      dialogEntry.set(undefined)
    }
  }
  $: resetDialogEntry(dialogOpen)
</script>

<Dialog.Root bind:open={dialogOpen}>
  {#if hoverEntry}
    <Dialog.Content class="max-w-[80svw] max-h-[90svh]">
      <Dialog.Header>
        <Dialog.Title>{hoverEntry.fields.title}</Dialog.Title>
        <Dialog.Description
          >{authorsToStringVerbose(
            hoverEntry.fields.author ?? []
          )}</Dialog.Description
        >
      </Dialog.Header>

      <div class="flex gap-3 items-start">
        <div class="flex-1 prose max-h-[80svh] overflow-auto">
          <p>
            {parseCategories(hoverEntry).join(', ')}, {hoverEntry.fields.date ??
              ''}
          </p>
          <p>
            {hoverEntry.fields.abstract ?? ''}
          </p>
          <details>
            <summary>
              <h4>BibTex</h4>
            </summary>
            <pre
              style="white-space: pre; overflow-x: hidden;">{hoverEntry.input}</pre>
          </details>
        </div>

        <div class="flex-1 max-h-[80svh] flex flex-col justify-between gap-3">
          <div class="overflow-auto">
            <BibTableImg
              bibKey={hoverEntry.key}
              className="rounded-md border"
              width=""
              dir="raw"
            ></BibTableImg>
          </div>

          <div class="flex justify-end gap-3">
            <Button
              on:click={() => {
                if (!hoverEntry?.fields.doi?.length) return
                window.location.href = `https://doi.org/${hoverEntry.fields.doi}`
              }}
            >
              Visit Page
            </Button>
            <Button
              on:click={() => {
                if (!hoverEntry) return
                navigator.clipboard.writeText(hoverEntry.input)
                toast.success('BibTex has been copied', {
                  description: hoverEntry.fields.title,
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
