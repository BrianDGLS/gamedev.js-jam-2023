/**
 * Bless this mess
 */

import Phaser from "phaser"
import {
    clamp,
    decrementHour,
    decrementMinute,
    hourHandRadians,
    incrementHour,
    incrementMinute,
    minuteHandRadians,
    normalizeHour,
} from "./utils"

export enum GameScenes {
    START_MENU = "start-menu",
    CLOCK_SELECT = "clock-select",
    GAME = "game",
    LOADING = "loading",
}

export enum ClockSprite {
    RETRO_CLOCK = "retro-clock",
    SQUARE_CLOCK = "square-clock",
    WATCH_CLOCK = "watch",
    DEFAULT = WATCH_CLOCK,
}

export enum EnemySprite {
    DIGITAL_CLOCK = "digital-clock",
}

export const loadSprite = (scene: Phaser.Scene, sprite: string) => {
    scene.load.image(sprite, sprite + ".svg")
}

const fadeOutScene = (sceneName, context, data) => {
    context.cameras.main.fadeOut(250)
    context.events.off()
    context.time.addEvent({
        delay: 250,
        callback: function () {
            context.scene.start(sceneName, data)
        },
        callbackScope: context,
    })
}

class ClockSelect extends Phaser.Scene {
    music: any
    selectedOption = ClockSprite.DEFAULT

    emitter = new Phaser.Events.EventEmitter()

    constructor() {
        super({ key: GameScenes.CLOCK_SELECT })
    }

    init({ music }: any) {
        this.music = music
    }

    create() {
        const { width, height } = this.sys.canvas
        const bg = this.add
            .image(width / 2, height / 2, "background")
            .setDepth(-2)
            .setTint(0x00ff88)
        this.addScreenTitle()

        this.addOption(ClockSprite.WATCH_CLOCK, 150)
        this.addOption(ClockSprite.SQUARE_CLOCK, 350)
        this.addOption(ClockSprite.RETRO_CLOCK, 550)

        this.addStartButton()
    }

    addScreenTitle() {
        const { width } = this.sys.game.canvas
        const box = this.add.rectangle(width / 2, 30, width, 100, 0x000, 0)
        const text = this.add.text(width / 2, 30, "Choose a clock", {
            fontFamily: "Arial",
            fontSize: 32,
            color: "#FFF",
            align: "center",
        })
        Phaser.Display.Align.In.Center(text, box)
    }

    styleButton(btn: Phaser.GameObjects.Rectangle) {
        btn.setInteractive({ cursor: "pointer" })
            .setStrokeStyle(2, 0x000)
            .setFillStyle(0xd2634e)

        btn.on("pointerdown", () => {
            btn.setScale(0.9)
        })

        btn.on("pointerup", () => {
            btn.setScale(1)
        })

        btn.on("pointerover", () => {
            btn.setStrokeStyle(3, 0x000)
        })

        btn.on("pointerout", () => {
            btn.setStrokeStyle(2, 0x000)
        })
    }

    addStartButton() {
        let { width } = this.sys.game.canvas
        const btn = this.add.rectangle(width / 2, 725, 200, 50, 0xd2634e, 0)

        this.styleButton(btn)

        btn.on("pointerup", () => {
            this.music.stop()
            fadeOutScene(GameScenes.GAME, this, {
                playerSpriteName: this.selectedOption,
            })
        })

        const text = this.add.text(width / 2, 725, "Start", {
            fontFamily: "Arial",
            fontSize: 28,
            color: "#fff",
            align: "center",
        })
        Phaser.Display.Align.In.Center(text, btn)
    }

    addOption(spriteName: ClockSprite, y: number) {
        let { width } = this.sys.game.canvas
        const sprite = this.add
            .sprite(width / 2, y, spriteName)
            .setScale(0.8)
            .setInteractive({
                cursor: "pointer",
            })

        const btn = this.add.rectangle(width / 2, y + 85, 150, 40, 0x000, 0)
        this.styleButton(btn)

        const isSelected = this.selectedOption === spriteName
        const text = this.add.text(
            width / 2,
            y + 100,
            `Select${isSelected ? "ed" : ""}`,
            {
                fontFamily: "Arial",
                fontSize: 24,
                color: "#FFF",
                align: "center",
            },
        )
        Phaser.Display.Align.In.Center(text, btn)

        btn.on("pointerup", () => this.emitter.emit("selection", spriteName))
        sprite.on("pointerup", () => this.emitter.emit("selection", spriteName))

        this.emitter.on("selection", (selectedSprite: ClockSprite) => {
            try {
                const status =
                    selectedSprite === spriteName ? "Selected" : "Select"
                this.selectedOption = selectedSprite
                text.setText(status)
                Phaser.Display.Align.In.Center(text, btn)
            } catch {}
        })
    }
}

export type Vec2 = { x: number; y: number }

class Clock {
    protected _hour: number
    public get hour() {
        return this._hour
    }
    public set hour(hour: number) {
        this._hour = normalizeHour(hour)
    }
    public health = 3
    public minute: number
    public radius: number
    public center: Phaser.Math.Vector2
    public hitBox: Phaser.Physics.Arcade.Body
    public sprite: Phaser.Physics.Arcade.Sprite

    public equals(digitalClock: DigitalClock): boolean {
        return (
            this.hour === normalizeHour(digitalClock.hour) &&
            this.minute === digitalClock.minute
        )
    }
}

class DigitalClock {
    public hour: number
    public speed: number
    public minute: number
    public targeted: boolean
    public text: Phaser.GameObjects.Text
    public sprite: Phaser.Physics.Arcade.Sprite

    get timeString() {
        const hour = this.hour.toString()
        const minute = this.minute.toString()

        return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
    }
}

class Bullet {
    active = false
    velocity = 400
    target: Phaser.Physics.Arcade.Sprite
    sprite: Phaser.Physics.Arcade.Sprite
}

class Game extends Phaser.Scene {
    selectedSprite = ClockSprite.DEFAULT

    score = 0

    clock: Clock
    bullet: Bullet
    digitalClock: DigitalClock
    hourHand: Phaser.GameObjects.Sprite
    minuteHand: Phaser.GameObjects.Sprite
    music: any
    bossMusic: any

    enemySpriteOptions = [EnemySprite.DIGITAL_CLOCK]

    lifeBar: Phaser.GameObjects.Image
    scoreBar: Phaser.GameObjects.Image
    scoreText: Phaser.GameObjects.Text

    leftPlus: Phaser.GameObjects.Image
    leftMinus: Phaser.GameObjects.Image
    rightPlus: Phaser.GameObjects.Image
    rightMinus: Phaser.GameObjects.Image

    particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter

    themeTint = 0x0ffcc00

    constructor() {
        super({ key: GameScenes.GAME })
    }

    setUpClock(clockSprite: ClockSprite): Clock {
        const { width, height } = this.sys.game.canvas
        const clock = new Clock()
        clock.health = 3
        clock.hour = 12
        clock.minute = 15
        clock.radius = 75
        clock.center = new Phaser.Math.Vector2(
            clock.radius / 2,
            clock.radius / 2,
        )
        clock.sprite = this.physics.add.staticSprite(
            width / 2,
            height - 100,
            clockSprite,
        )
        clock.sprite.setSize(clock.radius * 1.5, clock.radius * 1.5)
        return clock
    }

    setUpBullet(bullet?: Bullet): Bullet {
        if (!bullet) {
            bullet = new Bullet()
        }

        if (!bullet.sprite || !bullet.sprite.body) {
            bullet.sprite = this.physics.add.sprite(0, 0, "bullet")
        }

        bullet.sprite.setVisible(true)
        bullet.sprite.setX(this.clock.sprite.x)
        bullet.sprite.setY(this.clock.sprite.y - this.clock.radius)
        bullet.target = this.digitalClock.sprite
        bullet.active = true

        return bullet
    }

    setUpDigitalClock(digitalCLock?: DigitalClock): DigitalClock {
        const { width } = this.sys.canvas

        if (!digitalCLock) {
            digitalCLock = new DigitalClock()
            digitalCLock.sprite = this.physics.add.sprite(
                0,
                0,
                EnemySprite.DIGITAL_CLOCK,
            )
            digitalCLock.text = this.add.text(0, 0, "")
        }

        digitalCLock.sprite.setY(-100)
        digitalCLock.sprite.setX(Phaser.Math.Between(0, width))

        digitalCLock.speed = clamp(80 + this.score * 2, 80, 220)
        digitalCLock.hour = Phaser.Math.Between(0, 23)
        digitalCLock.minute = Phaser.Math.Between(0, 11) * 5

        digitalCLock.targeted = false

        digitalCLock.text.setX(digitalCLock.sprite.x)
        digitalCLock.text.setY(digitalCLock.sprite.y)
        digitalCLock.text.setText(digitalCLock.timeString)
        digitalCLock.text.setOrigin(0.5, 0.5)
        digitalCLock.text.setFont("monospace")
        digitalCLock.text.setColor("#000")
        digitalCLock.text.setFontSize(32)

        return digitalCLock
    }

    setUpHourHand(): Phaser.GameObjects.Sprite {
        let x = this.clock.sprite.x
        let y = this.clock.sprite.y
        let tint = 0x000
        switch (this.selectedSprite) {
            case ClockSprite.SQUARE_CLOCK:
                y = y - 2
                break
            case ClockSprite.RETRO_CLOCK:
                y = y - 10
                break
            default:
                x = x - 2
                y = y - 1
        }
        return this.add
            .sprite(x, y, "clock-hand")
            .setOrigin(0.5, 1)
            .setScale(1.2, 0.7)
            .setTint(tint)
            .setRotation(hourHandRadians(this.clock.hour))
    }

    setUpMinuteHand(): Phaser.GameObjects.Sprite {
        let x = this.clock.sprite.x
        let y = this.clock.sprite.y
        let tint = 0x000
        switch (this.selectedSprite) {
            case ClockSprite.SQUARE_CLOCK:
                y = y - 1
                x = x
                break
            case ClockSprite.RETRO_CLOCK:
                y = y - 8
                break
            default:
                y = y - 2
                x = x - 2
        }
        return this.add
            .sprite(x, y, "clock-hand")
            .setOrigin(0.5, 1)
            .setScale(0.8, 1)
            .setTint(tint)
            .setRotation(minuteHandRadians(this.clock.minute))
    }

    setBackgroundTint() {
        const { width, height } = this.sys.game.canvas
        const bg = this.add
            .image(width / 2, height / 2, "background")
            .setDepth(-2)
        switch (this.selectedSprite) {
            case ClockSprite.SQUARE_CLOCK:
                this.themeTint = 0x00ffff
                break
            case ClockSprite.RETRO_CLOCK:
                this.themeTint = 0x7700ff
                break
            default:
                this.themeTint = 0x0ffcc00
        }

        bg.setTint(this.themeTint)
    }

    init({ playerSpriteName }: { playerSpriteName: ClockSprite }) {
        if (playerSpriteName) {
            this.selectedSprite = playerSpriteName
        }
    }

    create() {
        this.bossMusic = this.sound.add("boss-music", { volume: 0.2 })
        this.bossMusic.setLoop(true)
        this.music = this.sound.add("music", { volume: 0.2 })
        this.music.setLoop(true)
        this.music.play()

        this.score = 0

        this.setBackgroundTint()
        this.clock = this.setUpClock(this.selectedSprite)
        this.hourHand = this.setUpHourHand()
        this.minuteHand = this.setUpMinuteHand()

        this.setUpKeyboardInput()
        this.setUpPointerInput()

        this.digitalClock = this.setUpDigitalClock()

        this.scoreBar = this.add.image(90, 30, "score")
        this.scoreText = this.add
            .text(100, 23, this.score.toString())
            .setFontFamily("monospace")
            .setColor("#000")
        this.lifeBar = this.getLifeBar(this.clock.health)

        this.particleEmitter = this.add
            .particles(0, 0, "bullet", {
                lifespan: 1000,
                speed: { min: 150, max: 250 },
                scale: { start: 0.8, end: 0 },
                gravityY: 0,
                blendMode: "ADD",
                emitting: false,
            })
            .setParticleTint(this.themeTint)

        this.events.once("destroy", () => {
            this.music.destroy()
            this.bossMusic.destroy()
            const allSprites = this.children.list.filter(
                (x) => x instanceof Phaser.GameObjects.Sprite,
            )
            allSprites.forEach((x) => x.destroy())
        })
    }

    update() {
        this.physics.moveToObject(
            this.digitalClock.sprite,
            this.clock.sprite,
            this.digitalClock.speed,
        )
        this.digitalClock.text.setX(this.digitalClock.sprite.x)
        this.digitalClock.text.setY(this.digitalClock.sprite.y)

        if (
            this.clock.equals(this.digitalClock) &&
            !this.digitalClock.targeted
        ) {
            this.digitalClock.targeted = true
            this.bullet = this.setUpBullet(this.bullet)
            this.sound.play("shoot")
        }

        if (this.bullet?.active) {
            this.physics.moveToObject(
                this.bullet.sprite,
                this.bullet.target,
                this.bullet.velocity,
            )
        }

        if (
            this.bullet?.active &&
            this.physics.collide(this.bullet.sprite, this.digitalClock.sprite)
        ) {
            this.bullet.active = false
            this.bullet.sprite.setVisible(false)
            this.createExplosion(
                this.digitalClock.sprite.x,
                this.digitalClock.sprite.y,
                16,
            )
            this.destroyEnemy()
            this.digitalClock = this.setUpDigitalClock(this.digitalClock)
        }

        if (this.physics.collide(this.digitalClock.sprite, this.clock.sprite)) {
            this.playerTakesDamage()
            this.createExplosion(
                this.digitalClock.sprite.x,
                this.digitalClock.sprite.y,
                16,
            )
            this.digitalClock = this.setUpDigitalClock(this.digitalClock)
        }
    }

    createExplosion(x: number, y: number, count: number) {
        this.particleEmitter.setX(x)
        this.particleEmitter.setY(y)
        this.particleEmitter.explode(count)
    }

    playerTakesDamage = () => {
        const shakeDuration = 300
        this.cameras.main.shake(shakeDuration)

        this.clock.sprite.setTint(0xff0000)
        this.clock.sprite.setAlpha(0.5)

        this.sound.play("player-hurt")

        setTimeout(() => {
            this.clock.sprite.setTint()
            this.clock.sprite.setAlpha(1)
            this.clock.health -= 1
            this.lifeBar.destroy(true)
            this.lifeBar = this.getLifeBar(this.clock.health)

            if (this.clock.health === 1) {
                this.music.stop()
                this.bossMusic.play()
            }

            if (this.clock.health <= 0) {
                this.createExplosion(
                    this.clock.sprite.x,
                    this.clock.sprite.y,
                    300,
                )

                setTimeout(() => {
                    this.createExplosion(
                        this.clock.sprite.x,
                        this.clock.sprite.y,
                        200,
                    )
                }, 500)

                setTimeout(() => {
                    this.createExplosion(
                        this.clock.sprite.x,
                        this.clock.sprite.y,
                        100,
                    )
                }, 1000)

                setTimeout(() => {
                    if (localStorage.getItem("scores")) {
                        const scoreArray: string[] = JSON.parse(
                            localStorage.getItem("scores") ?? "",
                        )

                        if (scoreArray) {
                            scoreArray.push(this.score.toString())
                            localStorage.setItem(
                                "scores",
                                JSON.stringify(scoreArray),
                            )
                        }
                    } else {
                        localStorage.setItem(
                            "scores",
                            JSON.stringify([this.score]),
                        )
                    }
                    fadeOutScene(GameScenes.START_MENU, this, {
                        score: this.score,
                        themeTint: this.themeTint,
                    })
                    this.bossMusic.stop()
                }, 2000)
            }
        }, shakeDuration)
    }

    destroyEnemy = () => {
        const shakeDuration = 100
        this.cameras.main.shake(shakeDuration)
        this.sound.play("enemy-hit")

        setTimeout(() => {
            this.score += 1
            this.scoreText.setText(this.score.toString())
        }, shakeDuration)
    }

    getLifeBar(clockHealth: number): Phaser.GameObjects.Image {
        const { width } = this.sys.game.canvas
        let spriteName = "life-empty"

        switch (clockHealth) {
            case 3:
                spriteName = "life-full"
                break
            case 2:
                spriteName = "life-2"
                break
            case 1:
                spriteName = "life-1"
                break
        }

        return this.add.image(width - 95, 30, spriteName).setFlipX(true)
    }

    incrementHourHand = () => {
        this.clock.hour = incrementHour(this.clock.hour)
        this.hourHand.setRotation(hourHandRadians(this.clock.hour))
        this.sound.play("hour-increment")
    }

    decrementHourHand = () => {
        this.clock.hour = decrementHour(this.clock.hour)
        this.hourHand.setRotation(hourHandRadians(this.clock.hour))
        this.sound.play("hour-decrement")
    }

    incrementMinuteHand = () => {
        this.clock.minute = incrementMinute(this.clock.minute)
        this.minuteHand.setRotation(minuteHandRadians(this.clock.minute))
        this.sound.play("minute-increment")
    }

    decrementMinuteHand = () => {
        this.clock.minute = decrementMinute(this.clock.minute)
        this.minuteHand.setRotation(minuteHandRadians(this.clock.minute))
        this.sound.play("minute-decrement")
    }

    setUpPointerInput() {
        const { width, height } = this.sys.canvas

        this.leftMinus = this.add
            .image(80, height - 50, "minus")
            .setInteractive({ cursor: "pointer" })
        this.rightMinus = this.add
            .image(width - 80, height - 50, "minus")
            .setInteractive({ cursor: "pointer" })
        this.leftPlus = this.add
            .image(40, height - 110, "plus")
            .setInteractive({ cursor: "pointer" })
        this.rightPlus = this.add
            .image(width - 40, height - 110, "plus")
            .setInteractive({ cursor: "pointer" })

        this.leftPlus.on("pointerup", () => {
            this.incrementHourHand()
            this.leftPlus.setScale(1)
        })
        this.leftPlus.on("pointerdown", () => {
            this.leftPlus.setScale(0.9)
        })

        this.leftMinus.on("pointerup", () => {
            this.decrementHourHand()
            this.leftMinus.setScale(1)
        })
        this.leftMinus.on("pointerdown", () => {
            this.leftMinus.setScale(0.9)
        })

        this.rightPlus.on("pointerup", () => {
            this.incrementMinuteHand()
            this.rightPlus.setScale(1)
        })
        this.rightPlus.on("pointerdown", () => {
            this.rightPlus.setScale(0.9)
        })

        this.rightMinus.on("pointerup", () => {
            this.decrementMinuteHand()
            this.rightMinus.setScale(1)
        })
        this.rightMinus.on("pointerdown", () => {
            this.rightMinus.setScale(0.9)
        })
    }

    setUpKeyboardInput() {
        const up = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP,
        )
        const down = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN,
        )
        const right = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
        )
        const left = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT,
        )

        up?.on("up", this.incrementHourHand)
        down?.on("up", this.decrementHourHand)

        right?.on("up", this.incrementMinuteHand)
        left?.on("up", this.decrementMinuteHand)
    }
}

export class StartMenu extends Phaser.Scene {
    score: number
    themeTint = 0x00ff88

    music: any

    constructor() {
        super({ key: GameScenes.START_MENU })
    }

    init({ score, themeTint }: { score: number; themeTint: number }) {
        this.score = score
        if (!themeTint === undefined) {
            this.themeTint = themeTint
        }
    }

    create() {
        this.music = this.sound.add("menu-music", { volume: 0.2 })
        this.music.setLoop(true)
        if (!this.sound.locked) {
            this.music.play()
        } else {
            this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                this.music.play()
            })
        }

        const { width, height } = this.sys.game.canvas

        const bg = this.add
            .image(width / 2, height / 2, "background")
            .setDepth(-2)
            .setTint(this.themeTint)

        this.add
            .image(width / 2, 200, "title")
            .setOrigin(0.5, 0.5)
            .setScale(1.2)

        if (this.score !== undefined) {
            this.add
                .text(width / 2, 300, "Game Over", {
                    fontFamily: "monospace",
                    fontSize: 32,
                })
                .setOrigin(0.5, 0.5)

            this.add
                .text(width / 2, 330, "You Scored: " + this.score, {
                    fontFamily: "monospace",
                    fontSize: 24,
                })
                .setOrigin(0.5, 0.5)
        }

        if (localStorage.getItem("scores")) {
            const scoreArray: string[] = JSON.parse(
                localStorage.getItem("scores") ?? "",
            )

            if (scoreArray) {
                this.add
                    .text(width / 2, 380, "Top Scores", {
                        fontFamily: "monospace",
                        fontSize: 32,
                    })
                    .setOrigin(0.5, 0.5)
                let y = 420
                for (const [index, score] of scoreArray
                    .map((s) => parseInt(s))
                    .sort((a, b) => (a > b ? -1 : 1))
                    .slice(0, 5)
                    .entries()) {
                    this.add
                        .text(
                            width / 2,
                            y + 30 * index,
                            index +
                                1 +
                                ". " +
                                score.toString().padStart(5, " "),
                            {
                                fontFamily: "monospace",
                                fontSize: 28,
                            },
                        )
                        .setOrigin(0.5, 0.5)
                }
            }
        }

        this.addStartButton()
    }

    addStartButton() {
        let { width } = this.sys.game.canvas
        const btn = this.add.rectangle(width / 2, 725, 200, 50, 0xd2634e, 0)

        this.styleButton(btn)

        btn.on("pointerup", () =>
            fadeOutScene(GameScenes.CLOCK_SELECT, this, { music: this.music }),
        )

        const text = this.add.text(width / 2, 725, "Play", {
            fontFamily: "Arial",
            fontSize: 28,
            color: "#fff",
            align: "center",
        })
        Phaser.Display.Align.In.Center(text, btn)
    }

    styleButton(btn: Phaser.GameObjects.Rectangle) {
        btn.setInteractive({ cursor: "pointer" })
            .setStrokeStyle(2, 0x000)
            .setFillStyle(0xd2634e)

        btn.on("pointerdown", () => {
            btn.setScale(0.9)
        })

        btn.on("pointerup", () => {
            btn.setScale(1)
        })

        btn.on("pointerover", () => {
            btn.setStrokeStyle(3, 0x000)
        })

        btn.on("pointerout", () => {
            btn.setStrokeStyle(2, 0x000)
        })
    }
}

class Loading extends Phaser.Scene {
    dots = 0
    maxDots = 3
    text: Phaser.GameObjects.Text
    constructor() {
        super({ key: GameScenes.LOADING })
    }

    preload() {
        this.load.path = "./assets/"
        this.load.image("background", "bg.png")
        this.load.image("plus", "plus-button.svg")
        this.load.image("minus", "minus-button.svg")
        this.load.image("score", "score.svg")
        this.load.image("bullet", "bullet.png")
        this.load.image("clock-hand", "clock-hand.svg")
        this.load.image("life-full", "life-bar-full.svg")
        this.load.image("life-2", "life-bar-2-health.svg")
        this.load.image("life-1", "life-bar-1-health.svg")
        this.load.image("life-empty", "life-bar-dead.svg")

        this.load.audio("hour-increment", "fxs/player/sfx_redmove_1.mp3")
        this.load.audio("hour-decrement", "fxs/player/sfx_redmove_2.mp3")
        this.load.audio("minute-increment", "fxs/player/sfx_bluemove_1.mp3")
        this.load.audio("minute-decrement", "fxs/player/sfx_bluemove_2.mp3")
        this.load.audio("player-hurt", "fxs/player/sfx_playerhurt_1.mp3")
        this.load.audio("shoot", "fxs/player/sfx_shootball_1.mp3")
        this.load.audio("enemy-hit", "fxs/enemy/sfx_enemyhit_1.mp3")
        this.load.audio("boss-music", "music/boss/mx_bossmusic_loop4bars_2.mp3")
        this.load.audio("music", "music/game/mx_gameplaymusic_loop8Bars.ogg")
        this.load.audio("menu-music", "music/menu/mx_menumusic_loop4bars_1.mp3")

        loadSprite(this, ClockSprite.SQUARE_CLOCK)
        loadSprite(this, ClockSprite.RETRO_CLOCK)
        loadSprite(this, ClockSprite.WATCH_CLOCK)
        loadSprite(this, EnemySprite.DIGITAL_CLOCK)

        this.load.image("title", "title-card.png")
    }

    create() {
        const { width, height } = this.sys.canvas
        this.text = this.add
            .text(width / 2, height / 2, "Loading   ", {
                fontFamily: "monospace",
                fontSize: 28,
            })
            .setOrigin(0.5, 0.5)

        const interval = setInterval(() => {
            this.dots++
            if (this.dots > this.maxDots) {
                this.dots = 0
            }
            this.text.setText(
                ("Loading" + ".".repeat(this.dots)).padEnd(10, " "),
            )
        }, 200)

        setTimeout(() => {
            clearInterval(interval)
            fadeOutScene(GameScenes.START_MENU, this, {})
        }, 6000)
    }
}

const config = {
    type: Phaser.AUTO,
    width: 375,
    height: 800,
    backgroundColor: "#000",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [Loading, StartMenu, ClockSelect, Game],
}

const game = new Phaser.Game(config)
