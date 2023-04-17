import kaboom from "kaboom"

kaboom({
    width: 480,
    height: 640,
    font: "sinko",
    background: [0, 0, 0],
})

scene("start-screen", () => {})
scene("end-screen", () => {})

const minuteHandDegree = (minute: number) => minute * 6
const normalizeMinute = (minute: number) => minute % 60 || 60

const hourHandDegree = (hour: number) => hour * 30
const normalizeHour = (hour: number) => (hour % 24) % 12 || 12

scene("game", () => {
    layers(["bg", "game", "ui"], "game")

    const player = add([
        "player",
        health(3),
        pos(width() / 2, height() - 100),
        circle(30),
    ])

    const hourHand = add([
        "hourHand",
        pos(player.pos),
        color(rgb(255, 0, 0)),
        rotate(0),
        {
            value: 12,
            draw() {
                drawLine({
                    p1: vec2(0, -player.radius),
                    p2: vec2(0, 0),
                    width: 4,
                    color: rgb(255, 0, 0),
                })
            },
            update() {
                this.angle = hourHandDegree(this.value)
            },
            incrementValue() {
                this.value += 1
            },
            decrementValue() {
                this.value -= 1
            },
            getValue() {
                return normalizeHour(this.value)
            },
        },
    ])

    const minuteHand = add([
        "minuteHand",
        pos(player.pos),
        color(rgb(255, 0, 0)),
        rotate(0),
        {
            value: 15,
            draw() {
                drawLine({
                    p1: vec2(0, -player.radius),
                    p2: vec2(0, 0),
                    width: 2,
                    color: rgb(0, 0, 255),
                })
            },
            update() {
                this.angle = minuteHandDegree(this.value)
            },
            incrementValue() {
                this.value += 5
            },
            decrementValue() {
                this.value -= 5
            },
            getValue() {
                return normalizeMinute(this.value)
            },
        },
    ])

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
})

go("game")
