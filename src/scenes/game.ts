import {
    allowClickable,
    clamp,
    getRandomHour,
    getRandomMinute,
    hourHandDegree,
    minuteHandDegree,
    normalizeHour,
} from "../utils"
import { GameScenes } from "./scenes"

export const game = (playerSprite: string) => {
    allowClickable()

    layers(["bg", "game", "ui"], "game")

    add([layer("bg"), sprite("bg", { width: width(), height: height() })])

    const score = add([
        layer("ui"),
        text("Score: 0", { size: 24 }),
        pos(24, 24),
        {
            value: 0,
            update() {
                this.text = `Score: ${this.value}`
            },
            incrementValue(amount: number) {
                this.value += amount
            },
        },
    ])

    const player = add([
        "player",
        area(),
        layer("ui"),
        pos(width() / 2, height() - 150),
        (origin as any)("center"),
        playerSprite,
        {
            radius: 55,
            centerPos() {
                return pos(this.pos.x, this.pos.y + 25)
            },
        },
    ])

    const enemy = add([
        "enemy",
        pos(width() / 2, 0),
        sprite("digital-clock", { width: 138, height: 63 }),
        area(),
        (origin as any)("center"),
        {
            speed: 40,
            scoreValue: 1,
            targeted: false,
            hour: getRandomHour(),
            minute: getRandomMinute(),
            update() {
                this.moveTo(player.pos, this.speed)
            },
            reset() {
                this.pos = vec2(rand(-0, width()), 0)
                this.targeted = false
                this.hour = getRandomHour()
                this.minute = getRandomMinute()
            },
            timeString() {
                const hour = this.hour.toString()
                const minute = this.minute.toString()

                return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
            },
            draw() {
                const text = formatText({
                    text: this.timeString(),
                    font: "sink",
                    origin: "center",
                    size: 22,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
            },
        },
    ])

    const lifeBar = add([
        "life-bar",
        health(3),
        {
            draw() {
                let spriteToDraw: string
                switch (this.hp()) {
                    case 3:
                        spriteToDraw = "life-bar"
                        break
                    case 2:
                        spriteToDraw = "life-bar-2-health"
                        break
                    case 1:
                        spriteToDraw = "life-bar-1-health"
                        break
                    default:
                        spriteToDraw = "life-bar-dead"
                }

                drawSprite({
                    sprite: spriteToDraw,
                    pos: vec2(width() - 200, 20),
                    flipX: true,
                    width: 174,
                    height: 33,
                })
            },
        },
    ])

    const hourHand = add([
        "hourHand",
        layer("ui"),
        player.centerPos(),
        color(rgb(255, 0, 0)),
        rotate(0),
        {
            value: 12,
            step: 1,
            draw() {
                drawLine({
                    p1: vec2(0, -player.radius * 0.7),
                    p2: vec2(0, 0),
                    width: 5,
                    color: rgb(255, 0, 0),
                })
            },
            update() {
                this.angle = hourHandDegree(this.value)
            },
            incrementValue() {
                if (this.value === 12) {
                    this.value = 1
                } else {
                    this.value = clamp(this.value + this.step, 0, 12)
                }
            },
            decrementValue() {
                if (this.value === 1) {
                    this.value = 12
                } else {
                    this.value = clamp(this.value - this.step, 0, 12)
                }
            },
            getValue() {
                return normalizeHour(this.value)
            },
        },
    ])

    const minuteHand = add([
        "minuteHand",
        layer("ui"),
        player.centerPos(),
        color(rgb(255, 0, 0)),
        rotate(0),
        {
            value: 15,
            step: 5,
            draw() {
                drawLine({
                    p1: vec2(0, -player.radius * 0.9),
                    p2: vec2(0, 0),
                    width: 4,
                    color: rgb(0, 0, 255),
                })
            },
            update() {
                this.angle = minuteHandDegree(this.value)
            },
            incrementValue() {
                if (this.value === 55) {
                    this.value = 0
                } else {
                    this.value = clamp(this.value + this.step, 0, 55)
                }
            },
            decrementValue() {
                if (this.value === 0) {
                    this.value = 55
                } else {
                    this.value = clamp(this.value - this.step, 0, 55)
                }
            },
            getValue() {
                return this.value % 60
            },
        },
    ])

    const incrementHourButton = add([
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(135, height() - 60),
        scale(0.5),
        sprite("plus-button", { width: 150, height: 152 }),
    ])

    incrementHourButton.onClick(() => {
        hourHand.incrementValue()
    })

    const decrementHourButton = add([
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(50, height() - 80),
        scale(0.5),
        sprite("minus-button", { width: 150, height: 152 }),
    ])

    decrementHourButton.onClick(() => {
        hourHand.decrementValue()
    })

    const incrementMinuteButton = add([
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(width() - 50, height() - 80),
        scale(0.5),
        sprite("plus-button", { width: 150, height: 152 }),
    ])

    incrementMinuteButton.onClick(() => {
        minuteHand.incrementValue()
    })

    const decrementMinuteButton = add([
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(width() - 135, height() - 60),
        scale(0.5),
        sprite("minus-button", { width: 150, height: 152 }),
    ])

    decrementMinuteButton.onClick(() => {
        minuteHand.decrementValue()
    })

    onUpdate(() => {
        const enemies = get("enemy")
        for (const enemy of enemies) {
            if (
                !enemy.targeted &&
                hourHand.getValue() === normalizeHour(enemy.hour) &&
                minuteHand.getValue() === enemy.minute
            ) {
                add([
                    "projectile",
                    sprite("firework", { height: 40 }),
                    pos(player.pos),
                    area(),
                    move(enemy.pos.angle(player.pos), 1200),
                ])
                enemy.targeted = true
            }
        }
    })

    onCollide("projectile", "enemy", (projectile, enemy) => {
        shake(10)
        enemy.reset()
        score.value += enemy.scoreValue
        projectile.destroy()
    })

    player.onCollide("enemy", (enemy) => {
        lifeBar.hurt(1)
        shake(20)
        const initialColor = player.color
        player.color = rgb(200, 100, 0)
        wait(0.5, () => {
            player.color = initialColor
        })
        enemy.reset()
    })

    lifeBar.onDeath(() => {
        wait(2, () => go(GameScenes.GAME_OVER, score.value))
    })

    onKeyPress("left", () => {
        minuteHand.decrementValue()
    })

    onKeyPress("right", () => {
        minuteHand.incrementValue()
    })

    onKeyPress("down", () => {
        hourHand.decrementValue()
    })

    onKeyPress("up", () => {
        hourHand.incrementValue()
    })
}
