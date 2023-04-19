import { clamp, makeHoverable } from "../utils"
import { Scenes } from "./scenes"

export const game = () => {
    layers(["bg", "game", "ui"], "game")

    const minuteHandDegree = (minute: number) => minute * 6

    const hourHandDegree = (hour: number) => hour * 30
    const normalizeHour = (hour: number) => (hour % 24) % 12 || 12

    const score = add([
        layer("ui"),
        text("Score: 0", { size: 24 }),
        pos(24, 24),
        {
            value: 0,
            update() {
                this.text = `Score: ${this.value}`
            },
            incrementValue() {
                this.value += 1
            },
        },
    ])

    const player = add([
        "player",
        area(),
        health(3),
        layer("ui"),
        pos(width() / 2, height() - 150),
        (origin as any)("center"),
        circle(50),
        {
            radius: 50,
            get width() {
                return this.radius * 2
            },
            get height() {
                return this.radius * 2
            },
        },
    ])

    const life: any = []
    for (let i = 1; i <= player.hp(); i++) {
        life.push(
            add([
                "life",
                layer("ui"),
                area(),
                pos(width() - i * 30, 20),
                circle(10),
            ]),
        )
    }

    const hourHand = add([
        "hourHand",
        layer("ui"),
        pos(player.pos),
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
        pos(player.pos),
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

    const enemy = add([
        "enemy",
        pos(width() / 2, 0),
        rect(100, 40),
        area(),
        (origin as any)("center"),
        color(0, 200, 0),
        {
            speed: 80,
            damage: 1,
            targeted: false,
            hour: Math.floor(rand(0, 24)),
            minute: Math.floor(rand(0, 12)) * 5,
            update() {
                this.moveTo(player.pos, this.speed)
            },
            reset() {
                this.pos = vec2(rand(-0, width()), 0)
                this.targeted = false
                this.hour = Math.floor(rand(0, 24))
                this.minute = Math.floor(rand(0, 12)) * 5
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
                    size: 24,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
            },
        },
    ])

    const incrementHourButton = add([
        (origin as any)("center"),
        area(),
        layer("ui"),
        cursor("pointer"),
        pos(110, height() - 60),
        color(255, 0, 0),
        circle(25),
        {
            radius: 25,
            get width() {
                return this.radius * 2
            },
            get height() {
                return this.radius * 2
            },
            draw() {
                const text = formatText({
                    text: " + ",
                    font: "sink",
                    origin: "center",
                    size: 40,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
            },
        },
    ])

    incrementHourButton.onClick(() => {
        hourHand.incrementValue()
    })

    const decrementHourButton = add([
        (origin as any)("center"),
        area(),
        layer("ui"),
        cursor("pointer"),
        pos(50, height() - 60),
        color(255, 0, 0),
        circle(25),
        {
            radius: 25,
            get width() {
                return this.radius * 2
            },
            get height() {
                return this.radius * 2
            },
            draw() {
                const text = formatText({
                    text: " - ",
                    font: "sink",
                    origin: "center",
                    size: 40,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
            },
        },
    ])

    decrementHourButton.onClick(() => {
        hourHand.decrementValue()
    })

    const incrementMinuteButton = add([
        (origin as any)("center"),
        area(),
        layer("ui"),
        cursor("pointer"),
        pos(width() - 50, height() - 60),
        color(0, 0, 255),
        circle(25),
        {
            radius: 25,
            get width() {
                return this.radius * 2
            },
            get height() {
                return this.radius * 2
            },
            draw() {
                const text = formatText({
                    text: " + ",
                    font: "sink",
                    origin: "center",
                    size: 40,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
            },
        },
    ])

    incrementMinuteButton.onClick(() => {
        minuteHand.incrementValue()
    })

    const decrementMinuteButton = add([
        (origin as any)("center"),
        area(),
        layer("ui"),
        cursor("pointer"),
        pos(width() - 110, height() - 60),
        color(0, 0, 255),
        circle(25),
        {
            radius: 25,
            get width() {
                return this.radius * 2
            },
            get height() {
                return this.radius * 2
            },
            draw() {
                const text = formatText({
                    text: " - ",
                    font: "sink",
                    origin: "center",
                    size: 40,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
            },
        },
    ])

    decrementMinuteButton.onClick(() => {
        minuteHand.decrementValue()
    })

    makeHoverable(incrementHourButton)
    makeHoverable(decrementHourButton)
    makeHoverable(incrementMinuteButton)
    makeHoverable(decrementMinuteButton)

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
                    rect(10, 10),
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
        projectile.destroy()
        enemy.reset()
        score.incrementValue()
    })

    player.onCollide("enemy", (enemy) => {
        player.hurt(enemy.damage)
        shake(20)
        const initialColor = player.color
        player.color = rgb(200, 100, 0)
        wait(0.5, () => {
            player.color = initialColor
        })
        enemy.reset()
        while (life.length > player.hp()) {
            life.pop().destroy()
        }
    })

    player.onDeath(() => {
        go(Scenes.GAME_OVER, score.value)
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
