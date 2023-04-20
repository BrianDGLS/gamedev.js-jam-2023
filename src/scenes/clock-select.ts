import { circleArea } from "../components/circle-area"
import { allowClickable } from "../utils"
import { Scenes } from "./scenes"

export const clockSelect = () => {
    allowClickable()

    let sprites = [rgb(255, 255, 255), rgb(255, 255, 0), rgb(255, 0, 255)]
    let playerSprite = sprites[0]

    for (let i = 1; i <= sprites.length; i++) {
        add([
            "option",
            "clickable",
            area(),
            circle(50),
            circleArea(50),
            pos(i * 130, 200),
            color(sprites[i - 1]),
            (origin as any)("center"),
            { value: sprites[i - 1] },
        ])

        add([
            "select-button",
            "clickable",
            rect(130, 50),
            color(0, 0, 0),
            (origin as any)("center"),
            area(),
            pos(i * 130, 320),
            outline(4, rgb(255, 255, 255)),
            {
                value: sprites[i - 1],
                selected: i === 1,
                draw() {
                    const text = formatText({
                        text: this.selected ? "Selected" : "Selected",
                        size: 18,
                        origin: "center",
                        color: this.selected
                            ? rgb(100, 0, 200)
                            : rgb(255, 255, 255),
                    })

                    drawFormattedText(text)
                },
            },
        ])
    }

    const select = (clicked) => {
        for (const btn of get("select-button")) {
            btn.selected = false
        }
        clicked.selected = true
        playerSprite = clicked.value
    }

    onClick("select-button", select)

    onClick("option", (clicked) => {
        select(get("select-button").find((_) => _.value === clicked.value))
    })

    const start = add([
        "clickable",
        rect(250, 50),
        color(0, 0, 0),
        (origin as any)("center"),
        area(),
        outline(4, rgb(255, 255, 255)),
        pos(width() / 2, height() - 100),
    ])

    start.onClick(() => go(Scenes.GAME, playerSprite))

    start.onDraw(() => {
        const text = formatText({
            text: "Start",
            size: 24,
            origin: "center",
            color: rgb(255, 255, 255),
        })

        drawFormattedText(text)
    })

    return play
}
