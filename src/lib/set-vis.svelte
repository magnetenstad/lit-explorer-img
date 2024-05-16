<script lang="ts">
  import { parse } from '@retorquere/bibtex-parser'
  import { onMount } from 'svelte'
  import {
    Camera,
    Game,
    PositionObject,
    TextObject,
    Vec2,
  } from 'web-game-engine'
  import { parseKeywords } from './bib'
  import { BibNode, BibSet } from './set-vis'

  onMount(async () => {
    const response = await fetch('/survis2/references.bib')
    const file = await response.text()
    const bib = parse(file)

    const gameDiv = document.querySelector('#set-vis')
    const options = {
      width: 1200,
      height: 800,
      scale: 1,
      fps: 60,
    }
    const game = new Game(gameDiv).setOptions(options)
    const center = new PositionObject(0, 0).activate(game)
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
    const bibSets = [...categories].map((category) =>
      new BibSet(0, 0, category).activate(game)
    )
    const bibNodes = []
    const connections: [BibNode, BibNode][] = []
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

    game.play()
  })
</script>

<div style="display: flex; justify-content: center;">
  <div id="set-vis"></div>
</div>
