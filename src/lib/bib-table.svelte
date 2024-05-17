<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Input } from '$lib/components/ui/input'
  import * as Table from '$lib/components/ui/table'
  import * as Tabs from '$lib/components/ui/tabs'
  import type { Creator, Entry } from '@retorquere/bibtex-parser'
  import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down'
  import ChevronDown from 'lucide-svelte/icons/chevron-down'
  import { onDestroy } from 'svelte'
  import {
    Render,
    Subscribe,
    createRender,
    createTable,
  } from 'svelte-headless-table'
  import {
    addHiddenColumns,
    addSortBy,
    addTableFilter,
  } from 'svelte-headless-table/plugins'
  import { toast } from 'svelte-sonner'
  import { type Readable } from 'svelte/store'
  import { parseKeywords } from './bib'
  import BibTableActions from './bib-table-actions.svelte'
  import BibTableImg from './bib-table-img.svelte'
  import { Button } from './components/ui/button'
  import ScrollArea from './components/ui/scroll-area/scroll-area.svelte'

  export let bibEntries: Readable<Entry[]>
  let unwrappedBibEntries: Entry[] = []
  bibEntries.subscribe((entries) => {
    unwrappedBibEntries = entries
  })

  const keywordsToCategoryString = (
    keywords: { key: string; value: string }[]
  ) => {
    const categories = keywords.filter(
      (keyword) => keyword.key.toLowerCase() == 'category'
    )
    return categories.reduce(
      (prev: string, curr) => prev + (prev.length ? ', ' : '') + curr.value,
      ''
    )
  }

  const authorsToString = (authors: Creator[]) => {
    if (authors.length == 0) {
      return 'Unknown'
    }
    if (authors.length == 1) {
      return `${authors[0].firstName} ${authors[0].lastName}`
    }
    if (authors.length == 2) {
      return `${authors[0].firstName} ${authors[0].lastName} and ${authors[1].firstName} ${authors[1].lastName}`
    }
    return `${authors[0].firstName} ${authors[0].lastName} et al.`
  }

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

  const table = createTable(bibEntries, {
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    hide: addHiddenColumns(),
  })
  const columns = table.createColumns([
    table.column({
      accessor: (fields) => fields.key,
      header: 'Image',
      cell: ({ value }) => {
        return createRender(BibTableImg, {
          bibKey: value,
          className: 'rounded-md border',
        })
      },
      plugins: {
        sort: {
          disable: true,
        },
      },
    }),
    table.column({
      accessor: (entry) => authorsToString(entry.fields.author ?? []),
      header: 'Author',
      plugins: {
        sort: {
          compareFn: (left, right) => {
            return ('' + left).localeCompare(right)
          },
        },
      },
    }),
    table.column({
      accessor: (entry) => entry.fields.title ?? '',
      header: 'Title',
    }),
    table.column({
      accessor: (entry) => entry.fields.date ?? '',
      header: 'Date',
    }),
    table.column({
      accessor: (entry) =>
        keywordsToCategoryString(parseKeywords(entry.fields.keywords ?? [])),
      header: 'Categories',
    }),
    // table.column({
    //   accessor: (entry) => entry.fields.doi ?? '',
    //   header: 'Doi',
    //   plugins: {
    //     sort: {
    //       disable: true,
    //     },
    //   },
    // }),
    table.column({
      accessor: (fields) => fields,
      header: '',
      cell: ({ value }) => {
        return createRender(BibTableActions, { bibEntry: value })
      },
      plugins: {
        sort: {
          disable: true,
        },
      },
    }),
  ])

  const {
    headerRows,
    pageRows,
    tableAttrs,
    tableBodyAttrs,
    pluginStates,
    flatColumns,
  } = table.createViewModel(columns)
  const { filterValue } = pluginStates.filter
  const { hiddenColumnIds } = pluginStates.hide

  const ids = flatColumns.map((col) => col.id)
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]))

  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id)

  const hidableCols = ['Image', 'Author', 'Date', 'Categories', 'Doi']

  let numEntries = 0
  const unsubscribe = bibEntries.subscribe((e) => (numEntries = e.length))
  onDestroy(unsubscribe)

  let hoverEntry: Entry | undefined = undefined
</script>

<Tabs.Root value="table">
  <Dialog.Root>
    <div class="flex justify-between gap-4 items-center py-4">
      <Input
        class="max-w-sm"
        placeholder={`Search in ${numEntries} publications`}
        type="text"
        bind:value={$filterValue}
      />
      <Tabs.List>
        <Tabs.Trigger value="table">Table</Tabs.Trigger>
        <Tabs.Trigger value="image-grid">Image Grid</Tabs.Trigger>
      </Tabs.List>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button variant="outline" class="ml-auto" builders={[builder]}>
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {#each flatColumns as col}
            {#if hidableCols.includes(col.id)}
              <DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
                {col.header}
              </DropdownMenu.CheckboxItem>
            {/if}
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <Tabs.Content value="table">
      <ScrollArea class="h-[90svh] rounded-md border">
        <Table.Root {...$tableAttrs}>
          <Table.Header>
            {#each $headerRows as headerRow}
              <Subscribe rowAttrs={headerRow.attrs()}>
                <Table.Row>
                  {#each headerRow.cells as cell (cell.id)}
                    <Subscribe
                      attrs={cell.attrs()}
                      let:attrs
                      props={cell.props()}
                      let:props
                    >
                      <Table.Head {...attrs}>
                        {#if ['Author', 'Title', 'Date', 'Categories'].includes(cell.id)}
                          <Button variant="ghost" on:click={props.sort.toggle}>
                            <Render of={cell.render()} />
                            <ArrowUpDown class={'ml-2 h-4 w-4'} />
                          </Button>
                        {:else}
                          <Render of={cell.render()} />
                        {/if}
                      </Table.Head>
                    </Subscribe>
                  {/each}
                </Table.Row>
              </Subscribe>
            {/each}
          </Table.Header>
          <Table.Body {...$tableBodyAttrs}>
            {#each $pageRows as row (row.id)}
              <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                <Table.Row
                  {...rowAttrs}
                  on:click={() => {
                    hoverEntry = unwrappedBibEntries.at(parseInt(row.id))
                  }}
                >
                  {#each row.cells as cell (cell.id)}
                    <Subscribe attrs={cell.attrs()} let:attrs>
                      <Table.Cell {...attrs}>
                        {#if ['Image', 'Title'].includes(cell.id)}
                          <Dialog.Trigger>
                            <Render of={cell.render()} />
                          </Dialog.Trigger>
                        {:else}
                          <Render of={cell.render()} />
                        {/if}
                      </Table.Cell>
                    </Subscribe>
                  {/each}
                </Table.Row>
              </Subscribe>
            {/each}
          </Table.Body>
        </Table.Root>
      </ScrollArea>
    </Tabs.Content>

    <Tabs.Content value="image-grid">
      <div class="flex flex-wrap gap-2 max-h-[90svh] overflow-auto">
        {#each unwrappedBibEntries as entry}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div on:mouseenter={() => (hoverEntry = entry)}>
            <Dialog.Trigger>
              <BibTableImg
                className="cursor-pointer hover:shadow-lg rounded-md border"
                bibKey={entry.key}
                width="140px"
              ></BibTableImg>
            </Dialog.Trigger>
          </div>
        {/each}
      </div>
    </Tabs.Content>

    {#if hoverEntry}
      <Dialog.Content class="max-w-[800px]">
        <Dialog.Header>
          <Dialog.Title>{hoverEntry.fields.title}</Dialog.Title>
          <Dialog.Description
            >{authorsToStringVerbose(
              hoverEntry.fields.author ?? []
            )}</Dialog.Description
          >
        </Dialog.Header>
        <div class="prose min-w-[100%]">
          <BibTableImg
            bibKey={hoverEntry.key}
            className="rounded-md border float-right"
            width="300px"
          ></BibTableImg>
          <p>{hoverEntry.fields.date ?? ''}</p>
          <p>
            {hoverEntry.fields.abstract ?? ''}
          </p>
          <p>
            {keywordsToCategoryString(
              parseKeywords(hoverEntry.fields.keywords ?? [])
            )}
          </p>
        </div>
        <Dialog.Footer>
          <Button
            on:click={() => {
              if (!hoverEntry?.fields.doi?.length) return
              window.location.href = `https://doi.org/${hoverEntry.fields.doi}`
            }}>Visit Page</Button
          >
          <Button
            on:click={() => {
              if (!hoverEntry) return
              navigator.clipboard.writeText(hoverEntry.input)
              toast.success('BibTex has been copied', {
                description: hoverEntry.fields.title,
              })
            }}>Copy BibText</Button
          >
        </Dialog.Footer>
      </Dialog.Content>
    {/if}
  </Dialog.Root>
</Tabs.Root>
