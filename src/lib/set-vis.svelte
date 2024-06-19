<script lang="ts">
  import { type Entry } from '@retorquere/bibtex-parser'
  import X from 'lucide-svelte/icons/x'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import {
    Camera,
    Game,
    MouseButton,
    PositionObject,
    TextObject,
    Vec2,
  } from 'web-game-engine'
  import { parseCategories } from './bib'
  import { dialogEntry, setVisFilter } from './bib-store'
  import BibTableImg from './bib-table-img.svelte'
  import Button from './components/ui/button/button.svelte'
  import { BibNode, BibSet, HightlightState, lineColor } from './set-vis'

  export let allBibEntries: Entry[]
  export let filteredBibEntries: Entry[]
  let gameDiv: HTMLDivElement

  class Center extends PositionObject {}
  const bibNodes: BibNode[] = []
  let selectedSets = new Set<BibSet>()
  let hoverNode: BibNode | null = null

  const getActiveBibNodes = () => {
    return bibNodes.filter((node) =>
      filteredBibEntries.some((entry) => node.key == entry.key)
    )
  }

  const getInactiveBibNodes = () => {
    return bibNodes.filter(
      (node) => !filteredBibEntries.some((entry) => node.key == entry.key)
    )
  }

  onMount(() => {
    const width = 1600
    const height = 750
    const game = new Game(gameDiv).setOptions({
      width,
      height,
      scale: 0.6,
      fps: 60,
    })
    const center = new Center(0, 0).activate(game)
    game.canvas.camera = new Camera(new Vec2(width, height)).setTarget(center)

    new TextObject(() => `FPS: ${game.currentFps.toFixed(1)}`, 8, 8, {
      gui: true,
      fillStyle: 'black',
    }).activate(game)

    const categories = new Set<string>()
    allBibEntries.forEach((entry) => {
      parseCategories(entry).forEach((category) => {
        categories.add(category)
      })
    })

    const bibSets = [...categories].map((category) => {
      const start = new Vec2(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height
      )
      return new BibSet(start.x, start.y, category, new Vec2(-100, 0)).activate(
        game
      )
    })
    const connections: [BibNode, BibNode][] = []
    let hoverSet: BibSet | null = null

    center.onMousePress = (ev) => {
      if (get(dialogEntry) != undefined) return

      if (ev.button == MouseButton.Left) {
        if (hoverNode) {
          dialogEntry.set(allBibEntries.find((e) => e.key == hoverNode?.key))
          return
        }

        if (hoverSet) {
          if (selectedSets.has(hoverSet)) {
            selectedSets.delete(hoverSet)
          } else {
            selectedSets.add(hoverSet)
          }
          selectedSets = selectedSets
          setVisFilter.set(
            selectedSets.size
              ? new Set(
                  [...selectedSets]
                    .flatMap((set) => set.nodes)
                    .map((node) => node.key)
                )
              : new Set()
          )
          return
        }
      }
    }

    allBibEntries.forEach((entry) => {
      let prevNode: BibNode | null = null
      parseCategories(entry).forEach((category) => {
        const bibSet = bibSets.find((b) => b.title == category)
        if (bibSet) {
          const node = new BibNode(
            bibSet.pos.x,
            bibSet.pos.y,
            entry.key,
            bibSet
          ).activate(game)
          bibNodes.push(node)
          if (prevNode) {
            connections.push([prevNode, node])
          }
          prevNode = node
        }
      })
    })

    game.beforeDraw = (ctx) => {
      ctx.canvas.drawRect(new Vec2(-1000, -1000), new Vec2(2000, 2000))
      const stepSize = 1 / Math.exp(ctx.t / 50)

      connections.forEach(([a, b]) => {
        ctx.canvas.drawLine(a.pos, b.pos, {}, { strokeStyle: lineColor })
        const l = a.pos.lengthTo(b.pos)
        a.speed = a.speed.plus(
          b.pos.minus(a.pos).multiply(Math.pow(l / 4000, 2))
        )
        b.speed = b.speed.plus(
          a.pos.minus(b.pos).multiply(Math.pow(l / 4000, 2))
        )
        a.bibSet.speed = a.bibSet.speed.plus(
          b.pos.minus(a.pos).multiply(Math.pow(l / 1000, 2) * stepSize)
        )
        b.bibSet.speed = b.bibSet.speed.plus(
          a.pos.minus(b.pos).multiply(Math.pow(l / 1000, 2) * stepSize)
        )
      })
    }

    const highlightNode = (node: BibNode, state: HightlightState) => {
      node.highlight = state

      connections.forEach(([a, b]) => {
        if (a == node || b == node) {
          a.highlight = state
          b.highlight = state
        }
      })
    }

    game.afterStep = (ctx) => {
      const mouse = ctx.input.mouse.worldPos
      hoverSet = null
      hoverNode = null
      const activeBibNodes = getActiveBibNodes()
      const inactiveBibNodes = getInactiveBibNodes()
      activeBibNodes.forEach((node) => {
        node.highlight = HightlightState.None
      })
      inactiveBibNodes.forEach((node) => {
        node.highlight = HightlightState.Inactive
      })
      bibSets.forEach((set) => (set.highlight = HightlightState.None))

      if (bibNodes.length) {
        let minNode = bibNodes[0]
        let minDistance = minNode.pos.lengthTo(mouse)
        bibNodes.forEach((node) => {
          const distance = node.pos.lengthTo(mouse)
          if (distance < minDistance) {
            minDistance = distance
            minNode = node
          }
        })

        if (minDistance < minNode.radius + 4) {
          hoverNode = minNode
        }
      }

      if (!hoverNode && bibSets.length) {
        let minSet = bibSets[0]
        let minDistance = minSet.pos.lengthTo(mouse)
        bibSets.forEach((node) => {
          const distance = node.pos.lengthTo(mouse)
          if (distance < minDistance) {
            minDistance = distance
            minSet = node
          }
        })

        if (minDistance < minSet.radius + 4) {
          hoverSet = minSet
        }
      }

      if (hoverSet) {
        hoverSet.highlight = HightlightState.Hover
        hoverSet.nodes.forEach((node) => {
          if (activeBibNodes.includes(node)) {
            highlightNode(node, HightlightState.Hover)
          }
        })
      }

      selectedSets.forEach((set) => {
        set.highlight = HightlightState.Selected
        set.nodes.forEach((node) => {
          if (activeBibNodes.includes(node)) {
            highlightNode(node, HightlightState.Selected)
          }
        })
      })

      if (hoverNode) {
        hoverNode.highlight = HightlightState.Hover
      }
    }

    for (let i = 0; i < 60 * 5; i++) {
      // @ts-ignore
      game.__step()
    }

    game.play()
  })

  let m = { x: 0, y: 0 }

  function handleMousemove(event: MouseEvent) {
    m.x = event.clientX
    m.y = event.clientY
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousemove={handleMousemove}>
  {#if selectedSets.size}
    <div class="relative">
      <Button
        class="absolute right-0 transform translate-y-[-45px]"
        variant="outline"
        on:click={() => {
          selectedSets.clear()
          setVisFilter.set(new Set())
          selectedSets = selectedSets
        }}><X size="20" />Clear Categories</Button
      >
    </div>
  {/if}

  {#if hoverNode}
    <div class="absolute" style={`top: ${m.y}px; left: ${m.x}px;`}>
      <BibTableImg bibKey={hoverNode.key} className="rounded-md border"
      ></BibTableImg>
      <p class="bg-white">
        {allBibEntries
          .find((e) => e.key == hoverNode?.key)
          ?.fields.title?.slice(0, 32)}..
      </p>
    </div>
  {/if}

  <div class="flex rounded-md border overflow-hidden">
    <div bind:this={gameDiv}></div>
  </div>
</div>
