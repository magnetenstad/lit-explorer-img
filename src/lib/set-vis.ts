import {
  PositionObject,
  Vec2,
  type DrawContext,
  type GameContext,
} from 'web-game-engine'
import { red500, red900, slate300, slate400, slate600 } from './colors'

export enum HightlightState {
  None,
  Hover,
  Selected,
  Inactive,
}

export const lineColor = slate600
const maxSpeedSet = 5
const maxSpeedNode = 10

export class BibNode extends PositionObject {
  key: string
  bibSet: BibSet
  speed = new Vec2(0, 0)
  highlight = HightlightState.None
  radius = 10

  constructor(x: number, y: number, key: string, bibSet: BibSet) {
    super(x, y)
    this.key = key
    this.bibSet = bibSet
    this.bibSet.nodes.push(this)
  }

  step(ctx: GameContext): void {
    if (ctx.t > 60 * 10) return

    const nodes = this.bibSet.nodes.filter((n) => n != this)

    nodes.forEach((node) => {
      if (this.pos.equals(node.pos)) {
        this.pos = this.pos.plus(
          new Vec2(0.5 - Math.random(), 0.5 - Math.random())
        )
      }
      const l = Math.max(this.pos.lengthTo(node.pos), 1)
      this.speed = this.speed.plus(
        this.pos.minus(node.pos).multiply(Math.pow(1 / l, 2))
      )
    })

    const l = Math.max(this.pos.lengthTo(this.bibSet.pos), 1)
    this.speed = this.speed.plus(
      this.bibSet.pos.minus(this.pos).multiply(l / 10000)
    )

    this.speed = this.speed
      .multiply(0.95)
      .clamp(
        new Vec2(-maxSpeedNode, -maxSpeedNode),
        new Vec2(maxSpeedNode, maxSpeedNode)
      )
    this.pos = this.pos.plus(this.speed)
  }

  getColors() {
    switch (this.highlight) {
      case HightlightState.None:
        return { fill: slate300, stroke: slate600 }
      case HightlightState.Hover:
        return { fill: red500, stroke: red900 }
      case HightlightState.Selected:
        return { fill: slate300, stroke: slate600 }
      case HightlightState.Inactive:
        return { fill: 'white', stroke: slate400 }
    }
  }

  draw(ctx: DrawContext): void {
    const colors = this.getColors()
    ctx.canvas.drawCircle(this.radius, this.pos, {
      fillStyle: colors.fill,
      strokeStyle: colors.stroke,
    })
  }
}

const bibsetMinRadius = 10
export class BibSet extends PositionObject {
  nodes: BibNode[] = []
  radius = bibsetMinRadius
  speed = new Vec2(0, 0)
  title: string
  highlight = HightlightState.None
  __zIndex = 1
  target: Vec2

  constructor(x: number, y: number, title: string, target: Vec2) {
    super(x, y)
    this.title = title
    this.target = target
  }

  step(ctx: GameContext): void {
    if (ctx.t > 60 * 10) return
    const stepSize = 10 / Math.exp(ctx.t / 100)

    const sets = ctx.game
      .getInstancesOfClass<BibSet>(BibSet)
      .filter((n) => n != this)

    sets.forEach((set) => {
      if (this.pos.equals(set.pos)) {
        this.pos = this.pos.plus(
          new Vec2((0.5 - Math.random()) * 100, (0.5 - Math.random()) * 100)
        )
      }
      const l = Math.max(
        Math.min(
          this.pos.lengthTo(set.pos),
          this.pos.lengthTo(set.pos.moveTowards(this.pos, set.radius))
        ),
        1
      )
      this.speed = this.speed.plus(
        this.pos.minus(set.pos).multiply(Math.pow(2.5 / l, 2))
      )
    })

    const l = Math.max(this.pos.lengthTo(this.target), 1)
    const delta = this.target.minus(this.pos)
    this.speed = this.speed.plus(
      new Vec2(delta.x * 0.4, delta.y).multiply(
        (Math.pow(this.nodes.length, 0.3) * l) / 200000
      )
    )

    this.speed = this.speed
      .multiply(0.95)
      .clamp(
        new Vec2(-maxSpeedSet, -maxSpeedSet),
        new Vec2(maxSpeedSet, maxSpeedSet)
      )
    this.pos = this.pos.plus(this.speed.multiply(stepSize))

    this.radius = bibsetMinRadius

    this.nodes.forEach((node) => {
      this.radius = Math.max(this.radius, this.pos.lengthTo(node.pos) + 20)
    })
  }

  getColor() {
    switch (this.highlight) {
      case HightlightState.None:
        return lineColor
      case HightlightState.Hover:
        return red500
      case HightlightState.Selected:
        return lineColor
    }
  }

  getLineWidth() {
    switch (this.highlight) {
      case HightlightState.None:
        return 1
      case HightlightState.Hover:
        return 5
      case HightlightState.Selected:
        return 5
    }
  }

  getTitlePos() {
    return this.pos
      .moveTowards(new Vec2(0, 0), -(this.radius + 40))
      .minus(new Vec2(10, 10))
  }
  draw(ctx: DrawContext): void {
    ctx.canvas.drawCircle(this.radius, this.pos, {
      fillStyle: 'transparent',
      strokeStyle: this.getColor(),
      lineWidth: this.getLineWidth(),
    })
    const pos = this.getTitlePos()
    ctx.canvas.drawLine(
      this.pos.moveTowards(pos, this.radius),
      pos,
      {},
      { strokeStyle: this.getColor(), lineWidth: this.getLineWidth() }
    )
    ctx.canvas.drawText(this.title, pos, {
      fillStyle: this.getColor(),
      fontSize: 20,
    })
  }
}
