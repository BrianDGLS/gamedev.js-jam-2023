import { Ball } from "./ball"
import { Keyboard } from "./keyboard"
import { layers } from "./layers"
import { clamp, hsla } from "./utils"

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480

const $stage = document.getElementById("stage") as HTMLDivElement

$stage.style.width = `${CANVAS_WIDTH}px`
$stage.style.height = `${CANVAS_HEIGHT}px`

for (const $canvas of $stage.querySelectorAll("canvas")) {
    $canvas.width = CANVAS_WIDTH
    $canvas.height = CANVAS_HEIGHT
}

const planet = new Ball(30, hsla(100))
planet.x = CANVAS_WIDTH / 2
planet.y = CANVAS_HEIGHT / 2

const innerArc = new Ball(planet.radius * 2, hsla(100, 50, 50, 0.2))
innerArc.x = planet.x
innerArc.y = planet.y

const outerArc = new Ball(planet.radius * 5, hsla(300, 50, 50, 0.2))
outerArc.x = planet.x
outerArc.y = planet.y

let arcRadius = planet.radius * 2
const defender = new Ball(10, hsla(200))
defender.x = planet.x + arcRadius
defender.y = planet.y

let angle = 0
let vr = 0.04
let speed = 4
let orbitSpeed = 0.01
let rotateClockWise = true

window.onload = function frame() {
    requestAnimationFrame(frame)

    const { bg, game, ui } = layers

    bg.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    game.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ui.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    bg.fillStyle = "#000"
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (Keyboard.isDown("ArrowDown")) {
        arcRadius = clamp(arcRadius - speed, innerArc.radius, outerArc.radius)
    }

    if (Keyboard.isDown("ArrowUp")) {
        arcRadius = clamp(arcRadius + speed, innerArc.radius, outerArc.radius)
    }

    if (Keyboard.isDown("ArrowLeft")) {
        rotateClockWise = true
        angle -= vr
    }

    if (Keyboard.isDown("ArrowRight")) {
        rotateClockWise = false
        angle += vr
    }

    if (!Keyboard.isDown("ArrowLeft") && !Keyboard.isDown("ArrowRight")) {
        angle += rotateClockWise ? -orbitSpeed : orbitSpeed
    }

    defender.x = planet.x + Math.cos(angle) * arcRadius
    defender.y = planet.y + Math.sin(angle) * arcRadius

    planet.draw(game)
    innerArc.draw(game)
    outerArc.draw(game)
    defender.draw(game)
}
