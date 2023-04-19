import kaboom from "kaboom"
import { startMenu } from "./scenes/start-menu"
import { Scenes } from "./scenes/scenes"
import { game } from "./scenes/game"
import { gameOver } from "./scenes/game-over"

kaboom({
    width: 512,
    height: 768,
    font: "sink",
    background: [0, 0, 0],
})

scene(Scenes.START_MENU, startMenu)
scene(Scenes.GAME_OVER, gameOver)
scene(Scenes.GAME, game)

go(Scenes.START_MENU)
