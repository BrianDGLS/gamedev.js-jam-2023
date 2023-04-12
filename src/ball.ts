import { Boundary } from "./boundary"
import { Context } from "./types/context"

export class Ball {
    public x = 0
    public y = 0
    public vx = 0
    public vy = 0
    public mass = 1
    public rotation = 0
    public scaleX = 1
    public scaleY = 1
    public lineWidth = 1

    constructor(public radius: number, public color: string) {}

    public draw(context: Context) {
        context.save()
        context.translate(this.x, this.y)
        context.rotate(this.rotation)
        context.scale(this.scaleX, this.scaleY)

        context.lineWidth = this.lineWidth
        context.fillStyle = this.color
        context.beginPath()
        //x, y, radius, start_angle, end_angle, anti-clockwise
        context.arc(0, 0, this.radius, 0, Math.PI * 2, true)
        context.closePath()
        context.fill()
        if (this.lineWidth > 0) {
            context.stroke()
        }
        context.restore()
    }

    public getBounds(): Boundary {
        return new Boundary(
            this.x - this.radius,
            this.y - this.radius,
            this.radius * 2,
            this.radius * 2,
        )
    }
}
