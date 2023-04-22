import Phaser from "phaser"
import { GameScenes } from "./scenes/scenes"

class ClockSelect extends Phaser.Scene {
    selectedOption = "pocket-watch"

    emitter = new Phaser.Events.EventEmitter()

    constructor() {
        super({ key: GameScenes.CLOCK_SELECT })
    }

    preload() {
        this.load.path = "/assets/"

        this.load.image("alarm-clock", "alarm-clock.svg")
        this.load.image("pocket-watch", "pocket-watch.svg")
        this.load.image("mantelpiece-clock", "mantelpiece-clock.svg")
    }

    create() {
        this.addScreenTitle()

        this.addOption("pocket-watch", 150)
        this.addOption("mantelpiece-clock", 350)
        this.addOption("alarm-clock", 550)

        this.addStartButton()
    }

    addScreenTitle() {
        let { width } = this.sys.game.canvas
        const box = this.add.rectangle(width / 2, 50, width, 100, 0x000, 0)
        const text = this.add.text(width / 2, 50, "Choose a clock", {
            fontFamily: "Arial",
            fontSize: 28,
            color: "#000",
            align: "center",
        })
        Phaser.Display.Align.In.Center(text, box)
    }

    styleButton(btn: Phaser.GameObjects.Rectangle) {
        btn.setInteractive({ cursor: "pointer" }).setStrokeStyle(1, 0xf00)

        btn.on("pointerover", () => {
            btn.setStrokeStyle(2, 0xf00)
        })

        btn.on("pointerout", () => {
            btn.setStrokeStyle(1, 0xf00)
        })
    }

    addStartButton() {
        let { width } = this.sys.game.canvas
        const btn = this.add.rectangle(width / 2, 725, 200, 50, 0x000, 0)

        this.styleButton(btn)

        btn.on("pointerup", () => this.scene.start(GameScenes.GAME))

        const text = this.add.text(width / 2, 725, "Start", {
            fontFamily: "Arial",
            fontSize: 28,
            color: "#000",
            align: "center",
        })
        Phaser.Display.Align.In.Center(text, btn)
    }

    addOption(spriteName: string, y: number) {
        let { width } = this.sys.game.canvas
        const sprite = this.add
            .sprite(width / 2, y, spriteName)
            .setScale(0.55)
            .setInteractive({
                cursor: "pointer",
            })

        const btn = this.add.rectangle(width / 2, y + 75, 150, 30, 0x000, 0)
        this.styleButton(btn)

        const isSelected = this.selectedOption === spriteName
        const text = this.add.text(
            width / 2,
            y + 100,
            `Select${isSelected ? "ed" : ""}`,
            {
                fontFamily: "Arial",
                fontSize: 24,
                color: "#000",
                align: "center",
            },
        )
        Phaser.Display.Align.In.Center(text, btn)

        btn.on("pointerup", () => this.emitter.emit("selection", spriteName))
        sprite.on("pointerup", () => this.emitter.emit("selection", spriteName))

        this.emitter.on("selection", (selectedSprite: string) => {
            const status = selectedSprite === spriteName ? "Selected" : "Select"
            text.setText(status)
            Phaser.Display.Align.In.Center(text, btn)
        })
    }
}

class Game extends Phaser.Scene {
    constructor() {
        super({ key: GameScenes.GAME })
    }

    create() {
        this.add.text(100, 100, "Game Started", {
            fontSize: 24,
        })
    }
}

const config = {
    type: Phaser.AUTO,
    width: 375,
    height: 800,
    backgroundColor: "#fbf0e4",
    scene: [ClockSelect, Game],
}

const game = new Phaser.Game(config)

// import kaboom from 'kaboom'
// import { startMenu } from "./scenes/start-menu"
// import { Scenes } from "./scenes/scenes"
// import { game } from "./scenes/game"
// import { gameOver } from "./scenes/game-over"
// import { clockSelect } from "./scenes/clock-select"
// import { loadAllSprites } from "./sprites"

// kaboom({
//     width: 512,
//     height: 768,
//     font: "sink",
//     global: true,
//     background: [0, 0, 0],
// })

// loadAllSprites()

// scene(Scenes.GAME, game)
// scene(Scenes.GAME_OVER, gameOver)
// scene(Scenes.START_MENU, startMenu)
// scene(Scenes.CLOCK_SELECT, clockSelect)

// go(Scenes.CLOCK_SELECT)
