import { Scenes } from "../scenes/scenes"

export const addPlayButton = (x: number, y: number) => {
    const play = add([
        "clickable",
        rect(250, 50),
        color(0, 0, 0),
        (origin as any)("center"),
        area(),
        outline(4, rgb(255, 255, 255)),
        pos(x, y),
    ])

    play.onClick(() => go(Scenes.CLOCK_SELECT))

    play.onDraw(() => {
        const text = formatText({
            text: "Click to play",
            size: 24,
            origin: "center",
            color: rgb(255, 255, 255),
        })

        drawFormattedText(text)
    })

    return play
}
