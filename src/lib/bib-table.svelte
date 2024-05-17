<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Input } from '$lib/components/ui/input'
  import * as Table from '$lib/components/ui/table'
  import type { Creator, Entry, Library } from '@retorquere/bibtex-parser'
  import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down'
  import ChevronDown from 'lucide-svelte/icons/chevron-down'
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
  import { writable } from 'svelte/store'
  import { parseKeywords } from './bib'
  import BibTableActions from './bib-table-actions.svelte'
  import { Button } from './components/ui/button'
  import ScrollArea from './components/ui/scroll-area/scroll-area.svelte'

  export let bib: Library
  const tableData = writable<Entry[]>(bib.entries)

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

  const table = createTable(tableData, {
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    hide: addHiddenColumns(),
  })
  const columns = table.createColumns([
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
    table.column({
      accessor: (entry) => entry.fields.doi ?? '',
      header: 'Doi',
      plugins: {
        sort: {
          disable: true,
        },
      },
    }),
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

  const hidableCols = ['Author', 'Date', 'Categories', 'Doi']
</script>

<div>
  <div class="flex items-center py-4">
    <Input
      class="max-w-sm"
      placeholder="Search.."
      type="text"
      bind:value={$filterValue}
    />
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
                    {#if ['Author', 'Title', 'Date'].includes(cell.id)}
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
            <Table.Row {...rowAttrs}>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <Table.Cell {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Cell>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Body>
    </Table.Root>
  </ScrollArea>
</div>
