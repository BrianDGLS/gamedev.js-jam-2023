import { circleArea } from "../components/circle-area"
import {
    allowClickable,
    clamp,
    getRandomHour,
    getRandomMinute,
    hourHandDegree,
    minuteHandDegree,
    normalizeHour,
} from "../utils"
import { Scenes } from "./scenes"

export const game = (playerSprite: any) => {
    allowClickable()

    layers(["bg", "game", "ui"], "game")

    let spawnBoss = false
    loop(40, () => {
        spawnBoss = true
    })

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
        health(3),
        layer("ui"),
        pos(width() / 2, height() - 150),
        (origin as any)("center"),
        color(playerSprite),
        circle(50),
        circleArea(50),
    ])

    const enemy = add([
        "enemy",
        pos(width() / 2, 0),
        rect(100, 40),
        area(),
        health(1),
        (origin as any)("center"),
        color(0, 200, 0),
        {
            speed: 80,
            scoreValue: 1,
            targeted: false,
            bossMode: false,
            hour: getRandomHour(),
            minute: getRandomMinute(),
            makeBoss() {
                this.bossMode = true
                this.heal(3)
                this.width = this.width * 2
                this.height = this.height * 2
                this.speed = this.speed / 2
                this.scoreValue = 5
                this.targeted = false
                this.pos = vec2(rand(-0, width()), 0)
            },
            update() {
                this.moveTo(player.pos, this.speed)
            },
            reset() {
                this.pos = vec2(rand(-0, width()), 0)
                this.targeted = false
                this.hour = getRandomHour()
                this.minute = getRandomMinute()
                if (this.bossMode) {
                    this.width = this.width / 2
                    this.height = this.height / 2
                    this.speed = this.speed * 2
                    this.health = 1
                    this.scoreValue = 1
                    this.bossMode = false
                }
                this.heal()
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
                    size: this.bossMode ? 48 : 24,
                    color: rgb(0, 0, 0),
                })

                drawFormattedText(text)
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

    const incrementHourButton = add([
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(110, height() - 60),
        color(255, 0, 0),
        circle(25),
        circleArea(25),
        {
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
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(50, height() - 60),
        color(255, 0, 0),
        circle(25),
        circleArea(25),
        {
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
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(width() - 50, height() - 60),
        color(0, 0, 255),
        circle(25),
        circleArea(25),
        {
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
        "clickable",
        (origin as any)("center"),
        area(),
        layer("ui"),
        pos(width() - 110, height() - 60),
        color(0, 0, 255),
        circle(25),
        circleArea(25),
        {
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
                    {
                        damage: 1,
                    },
                ])
                enemy.targeted = true
            }
        }
    })

    onCollide("projectile", "enemy", (projectile, enemy) => {
        shake(enemy.bossMode ? 20 : 10)
        enemy.hurt(projectile.damage)

        if (enemy.hp() > 0) {
            enemy.hour = getRandomHour()
            enemy.minute = getRandomMinute()
            enemy.targeted = false
        }

        projectile.destroy()
    })

    enemy.onDeath(() => {
        score.incrementValue(enemy.scoreValue)
        if (spawnBoss) {
            if (!enemy.bossMode && score.value > 5) {
                enemy.makeBoss()
            }
            spawnBoss = false
            enemy.reset()
        } else {
            enemy.reset()
        }
    })

    player.onCollide("enemy", (enemy) => {
        if (enemy.bossMode) {
            player.hurt(life.length)
            shake(30)
            const initialColor = player.color
            player.color = rgb(255, 0, 0)
            wait(0.5, () => {
                player.color = initialColor
            })
            loop(0.2, () => {
                if (life.length) {
                    life.pop().destroy()
                }
            })
        } else {
            player.hurt(1)
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
        }
    })

    player.onDeath(() => {
        wait(2, () => go(Scenes.GAME_OVER, score.value))
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
