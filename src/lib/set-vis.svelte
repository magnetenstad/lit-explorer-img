<script lang="ts">
  import { type Library } from '@retorquere/bibtex-parser'
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
  import { BibNode, BibSet, HightlightState } from './set-vis'

  let gameDiv: HTMLDivElement
  export let bib: Library

  class Center extends PositionObject {}

  onMount(async () => {
    const options = {
      width: 1600,
      height: 750,
      scale: 0.6,
      fps: 60,
    }
    const game = new Game(gameDiv).setOptions(options)
    const center = new Center(0, 0).activate(game)
    game.canvas.camera = new Camera(
      new Vec2(options.width, options.height)
    ).setTarget(center)

    new TextObject(() => `FPS: ${game.currentFps.toFixed(1)}`, 8, 8, {
      gui: true,
      fillStyle: 'black',
    }).activate(game)

    const categories = new Set<string>()
    bib.entries.forEach((entry) => {
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
    const bibNodes: BibNode[] = []
    const connections: [BibNode, BibNode][] = []
    const selectedSets = new Set<BibSet>()
    const selectedNodes = new Set<BibNode>()
    let hoverNode: BibNode | null = null
    let hoverSet: BibSet | null = null

    const selectNode = (node: BibNode) => {
      selectedNodes.add(node)
      connections.forEach(([a, b]) => {
        if (a == node || b == node) {
          selectedNodes.add(a)
          selectedNodes.add(b)
        }
      })
    }
    const unselectNode = (node: BibNode) => {
      selectedNodes.delete(node)
      connections.forEach(([a, b]) => {
        if (a == node || b == node) {
          selectedNodes.delete(a)
          selectedNodes.delete(b)
        }
      })
    }

    center.onMousePress = (ev) => {
      if (ev.button == MouseButton.Left && hoverSet) {
        if (selectedSets.has(hoverSet)) {
          selectedSets.delete(hoverSet)
          hoverSet.nodes.forEach((node) => unselectNode(node))
        } else {
          selectedSets.add(hoverSet)
          hoverSet.nodes.forEach((node) => selectNode(node))
        }
      }

      if (ev.button == MouseButton.Left && hoverNode) {
        if (selectedNodes.has(hoverNode)) {
          unselectNode(hoverNode)
        } else {
          selectNode(hoverNode)
        }
      }
    }

    bib.entries.forEach((entry) => {
      let prevNode: BibNode | null = null
      parseKeywords(entry.fields.keywords ?? [])
        .filter((kv) => kv.key == 'category')
        .forEach((kv) => {
          const bibSet = bibSets.find((b) => b.title == kv.value)
          if (bibSet) {
            const node = new BibNode(0, 0, bibSet).activate(game)
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
        ctx.canvas.drawLine(a.pos, b.pos, {}, { strokeStyle: 'black' })
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
      hoverNode = null
      hoverSet = null
      bibNodes.forEach((node) => (node.highlight = HightlightState.None))
      bibSets.forEach((set) => (set.highlight = HightlightState.None))
      selectedNodes.forEach((node) => {
        highlightNode(node, HightlightState.Selected)
      })

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

      if (hoverNode) {
        highlightNode(hoverNode, HightlightState.Hover)
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
        hoverSet.nodes.forEach((node) =>
          highlightNode(node, HightlightState.Hover)
        )
      }

      selectedSets.forEach((set) => {
        set.highlight = HightlightState.Selected
      })
    }

    game.play()
  })
</script>

<div class="flex rounded-md border overflow-hidden">
  <div bind:this={gameDiv}></div>
</div>
