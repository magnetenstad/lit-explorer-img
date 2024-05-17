<script lang="ts">
  import { type Entry } from '@retorquere/bibtex-parser'
  import { onMount } from 'svelte'
  import {
    Camera,
    Game,
    MouseButton,
    PositionObject,
    TextObject,
    Vec2,
  } from 'web-game-engine'
  import { parseKeywords } from './bib'
  import { setVisFilter } from './bib-store'
  import { BibNode, BibSet, HightlightState, lineColor } from './set-vis'

  export let allBibEntries: Entry[]
  export let filteredBibEntries: Entry[]
  let gameDiv: HTMLDivElement

  class Center extends PositionObject {}
  const bibNodes: BibNode[] = []

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
      parseKeywords(entry.fields.keywords ?? [])
        .filter((kv) => kv.key == 'category')
        .forEach((kv) => {
          categories.add(kv.value)
        })
    })

    let target = new Vec2(0, 0)
    const bibSets = [...categories].map((category) => {
      target = target
        .plus(new Vec2(200 * Math.max(1, Math.sign(target.x)), 0))
        .multiply(-1)
      return new BibSet(0, 0, category, target).activate(game)
    })
    const connections: [BibNode, BibNode][] = []
    const selectedSets = new Set<BibSet>()
    let hoverSet: BibSet | null = null

    center.onMousePress = (ev) => {
      if (ev.button == MouseButton.Left && hoverSet) {
        if (selectedSets.has(hoverSet)) {
          selectedSets.delete(hoverSet)
        } else {
          selectedSets.add(hoverSet)
        }
        setVisFilter.set(
          selectedSets.size
            ? new Set(
                [...selectedSets]
                  .flatMap((set) => set.nodes)
                  .map((node) => node.key)
              )
            : new Set()
        )
      }
    }

    allBibEntries.forEach((entry) => {
      let prevNode: BibNode | null = null
      parseKeywords(entry.fields.keywords ?? [])
        .filter((kv) => kv.key == 'category')
        .forEach((kv) => {
          const bibSet = bibSets.find((b) => b.title == kv.value)
          if (bibSet) {
            const node = new BibNode(0, 0, entry.key, bibSet).activate(game)
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

      connections.forEach(([a, b]) => {
        ctx.canvas.drawLine(a.pos, b.pos, {}, { strokeStyle: lineColor })
        const l = a.pos.lengthTo(b.pos)
        a.speed = a.speed.plus(
          b.pos.minus(a.pos).multiply(Math.pow(l / 4000, 2))
        )
        b.speed = b.speed.plus(
          a.pos.minus(b.pos).multiply(Math.pow(l / 4000, 2))
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
      const activeBibNodes = getActiveBibNodes()
      const inactiveBibNodes = getInactiveBibNodes()
      activeBibNodes.forEach((node) => {
        node.highlight = HightlightState.None
      })
      inactiveBibNodes.forEach((node) => {
        node.highlight = HightlightState.Inactive
      })
      bibSets.forEach((set) => (set.highlight = HightlightState.None))

      if (bibSets.length) {
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
    }

    game.play()
  })
</script>

<div class="flex rounded-md border overflow-hidden">
  <div bind:this={gameDiv}></div>
</div>
