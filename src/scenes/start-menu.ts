import { Scenes } from "./scenes"
import { makeHoverable } from "../utils"

export const startMenu = () => {
    const play = add([
        rect(250, 50),
        color(0, 0, 0),
        (origin as any)("center"),
        area(),
        outline(4, rgb(255, 255, 255)),
        pos(width() / 2, height() / 2),
    ])

    makeHoverable(play)

    play.onClick(() => go(Scenes.GAME))

    play.onDraw(() => {
        const text = formatText({
            text: "Click to play",
            size: 24,
            origin: "center",
            color: rgb(255, 255, 255),
        })

        drawFormattedText(text)
    })
}
