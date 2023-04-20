import { addPlayButton } from "../components/play-button"
import { allowClickable } from "../utils"

export const startMenu = () => {
    allowClickable()

    addPlayButton(width() / 2, height() / 2)
}
