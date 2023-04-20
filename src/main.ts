import kaboom from "kaboom"
import { startMenu } from "./scenes/start-menu"
import { Scenes } from "./scenes/scenes"
import { game } from "./scenes/game"
import { gameOver } from "./scenes/game-over"
import { clockSelect } from "./scenes/clock-select"

kaboom({
    width: 512,
    height: 768,
    font: "sink",
    background: [0, 0, 0],
})

scene(Scenes.GAME, game)
scene(Scenes.GAME_OVER, gameOver)
scene(Scenes.START_MENU, startMenu)
scene(Scenes.CLOCK_SELECT, clockSelect)

go(Scenes.START_MENU)
