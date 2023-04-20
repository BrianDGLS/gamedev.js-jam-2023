import { addPlayButton } from "../components/play-button"
import { allowClickable } from "../utils"

export const gameOver = (score = 0) => {
    allowClickable()

    add([
        text("Game Over", { size: 50 }),
        pos(width() / 2, 100),
        (origin as any)("center"),
    ])

    add([
        text("You scored: " + score, { size: 20 }),
        pos(width() / 2, 200),
        (origin as any)("center"),
    ])

    addPlayButton(width() / 2, height() / 2)
}
