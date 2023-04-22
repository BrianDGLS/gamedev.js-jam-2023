import { allowClickable } from "../utils"
import { GameScenes } from "./scenes"

export class ClockSelection {
    constructor(
        public sprite: string,
        public width: number,
        public height: number,
    ) {}

    getKaboomSprite() {
        return sprite(this.sprite, { width: this.width, height: this.height })
    }
}

export const clockSelect = () => {
    allowClickable()

    add([sprite("bg", { width: width(), height: height() })])

    add([text("Select a clock", { size: 28}), (origin as any)("center"), pos(width() / 2, 100)])

    const sprites: ClockSelection[] = [
        new ClockSelection("alarm-clock", 214, 214),
        new ClockSelection("pocket-watch", 155, 179),
        new ClockSelection("mantelpiece-clock", 216, 216),
    ]
    let playerSprite = sprites[0].getKaboomSprite()

    for (let i = 1; i <= sprites.length; i++) {
        add([
            "option",
            "clickable",
            area(),
            pos(i * 130, 300),
            scale(0.5),
            sprites[i - 1].getKaboomSprite(),
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
            pos(i * 130, 400),
            outline(4, rgb(255, 255, 255)),
            {
                value: sprites[i - 1],
                selected: i === 1,
                draw() {
                    const text = formatText({
                        text: this.selected ? "Selected" : "Select",
                        size: 16,
                        origin: "center",
                        color: this.selected
                            ? rgb(200, 0, 200)
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
        playerSprite = clicked.value.getKaboomSprite()
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

    start.onClick(() => go(GameScenes.GAME, playerSprite))

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
