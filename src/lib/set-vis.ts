import {
  PositionObject,
  Vec2,
  type DrawContext,
  type GameContext,
} from 'web-game-engine'

export class BibNode extends PositionObject {
  bibSet: BibSet
  speed = new Vec2(0, 0)

  constructor(x: number, y: number, bibSet: BibSet) {
    super(x, y)
    this.bibSet = bibSet
    this.bibSet.nodes.push(this)
  }

  step(ctx: GameContext): void {
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
      .clamp(new Vec2(-10, -10), new Vec2(10, 10))
    this.pos = this.pos.plus(this.speed)
  }

  draw(ctx: DrawContext): void {
    ctx.canvas.drawCircle(10, this.pos, {
      fillStyle: 'white',
      strokeStyle: 'black',
    })
  }
}

const bibsetMinRadius = 10
export class BibSet extends PositionObject {
  nodes: BibNode[] = []
  radius = bibsetMinRadius
  speed = new Vec2(0, 0)
  title: string
  __zIndex = 1

  constructor(x: number, y: number, title: string) {
    super(x, y)
    this.title = title
  }

  step(ctx: GameContext): void {
    const sets = ctx.game
      .getInstancesOfClass<BibSet>(BibSet)
      .filter((n) => n != this)

    sets.forEach((set) => {
      if (this.pos.equals(set.pos)) {
        this.pos = this.pos.plus(
          new Vec2((0.5 - Math.random()) * 10, (0.5 - Math.random()) * 10)
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

    const center = new Vec2(0, 0)
    const l = Math.max(this.pos.lengthTo(center), 1)
    this.pos = this.pos.moveTowards(center, l / 100)

    this.speed = this.speed
      .multiply(0.9)
      .clamp(new Vec2(-10, -10), new Vec2(10, 10))
    this.pos = this.pos.plus(this.speed)

    this.radius = bibsetMinRadius
    this.nodes.forEach((node) => {
      this.radius = Math.max(this.radius, this.pos.lengthTo(node.pos) + 20)
    })
  }

  draw(ctx: DrawContext): void {
    ctx.canvas.drawCircle(this.radius, this.pos, {
      fillStyle: 'transparent',
      strokeStyle: 'black',
    })
    const pos = this.pos
      .moveTowards(new Vec2(0, 0), -(this.radius + 40))
      .minus(new Vec2(10, 10))
    ctx.canvas.drawLine(
      this.pos.moveTowards(pos, this.radius),
      pos,
      {},
      { strokeStyle: 'black' }
    )
    ctx.canvas.drawText(this.title, pos, {
      fillStyle: 'black',
      fontSize: 20,
    })
  }
}
