import Phaser from "phaser"
import { GameScenes } from "./scenes/scenes"
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

class ClockSelect extends Phaser.Scene {
    selectedOption = ClockSprite.DEFAULT

    emitter = new Phaser.Events.EventEmitter()

    constructor() {
        super({ key: GameScenes.CLOCK_SELECT })
    }

    preload() {
        this.load.path = "/assets/"
        this.load.image("background", "bg.png")
        loadSprite(this, ClockSprite.SQUARE_CLOCK)
        loadSprite(this, ClockSprite.RETRO_CLOCK)
        loadSprite(this, ClockSprite.WATCH_CLOCK)
    }

    create() {
        const { width, height } = this.sys.canvas
        const bg = this.add
            .image(width / 2, height / 2, "background")
            .setDepth(-2)
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
        btn.setInteractive({ cursor: "pointer" }).setStrokeStyle(2, 0x000)
        .setFillStyle(0xd2634e)

        btn.on("pointerdown", () => {
            btn.setScale(.9)
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

        btn.on("pointerup", () =>
            this.scene.start(GameScenes.GAME, {
                playerSpriteName: this.selectedOption,
            }),
        )

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
            const status = selectedSprite === spriteName ? "Selected" : "Select"
            this.selectedOption = selectedSprite
            text.setText(status)
            Phaser.Display.Align.In.Center(text, btn)
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

    enemySpriteOptions = [EnemySprite.DIGITAL_CLOCK]

    lifeBar: Phaser.GameObjects.Image
    scoreBar: Phaser.GameObjects.Image
    scoreText: Phaser.GameObjects.Text

    leftPlus: Phaser.GameObjects.Image
    leftMinus: Phaser.GameObjects.Image
    rightPlus: Phaser.GameObjects.Image
    rightMinus: Phaser.GameObjects.Image

    emitter = new Phaser.Events.EventEmitter()
    particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter

    themeTint = 0x0ffcc00

    constructor() {
        super({ key: GameScenes.GAME })
    }

    setUpClock(clockSprite: ClockSprite): Clock {
        const { width, height } = this.sys.game.canvas
        const clock = new Clock()
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

        digitalCLock.speed = clamp(60 + this.score, 60, 110)
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
                y = y -1
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
                this.themeTint = 0x00FFFF
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

    preload() {
        this.load.path = "/assets/"
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

        loadSprite(this, this.selectedSprite)

        loadSprite(this, EnemySprite.DIGITAL_CLOCK)
    }

    create() {
        const { width, height } = this.sys.game.canvas

        this.setBackgroundTint()
        this.clock = this.setUpClock(this.selectedSprite)
        this.hourHand = this.setUpHourHand()
        this.minuteHand = this.setUpMinuteHand()

        this.setUpKeyboardInput()
        this.setUpPointerInput()

        this.digitalClock = this.setUpDigitalClock()

        // this.add.circle(width / 2, height - 120, 75, 0x000)

        this.scoreBar = this.add.image(90, 30, "score")
        this.scoreText = this.add
            .text(100, 23, this.score.toString())
            .setFontFamily("monospace")
            .setColor("#000")
        this.lifeBar = this.getLifeBar(this.clock.health)

        this.emitter.on("player-damaged", this.playerTakesDamage)
        this.emitter.on("enemy-destroyed", this.destroyEnemy)

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
            this.emitter.emit("enemy-destroyed")
            this.digitalClock = this.setUpDigitalClock(this.digitalClock)
        }

        if (this.physics.collide(this.digitalClock.sprite, this.clock.sprite)) {
            this.emitter.emit("player-damaged")
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

        setTimeout(() => {
            this.clock.sprite.setTint()
            this.clock.sprite.setAlpha(1)
            this.clock.health -= 1
            this.lifeBar.destroy(true)
            this.lifeBar = this.getLifeBar(this.clock.health)
        }, shakeDuration)
    }

    destroyEnemy = () => {
        const shakeDuration = 100
        this.cameras.main.shake(shakeDuration)

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
    }

    decrementHourHand = () => {
        this.clock.hour = decrementHour(this.clock.hour)
        this.hourHand.setRotation(hourHandRadians(this.clock.hour))
    }

    incrementMinuteHand = () => {
        this.clock.minute = incrementMinute(this.clock.minute)
        this.minuteHand.setRotation(minuteHandRadians(this.clock.minute))
    }

    decrementMinuteHand = () => {
        this.clock.minute = decrementMinute(this.clock.minute)
        this.minuteHand.setRotation(minuteHandRadians(this.clock.minute))
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

const config = {
    type: Phaser.AUTO,
    width: 375,
    height: 800,
    backgroundColor: "#fbf0e4",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [ClockSelect, Game],
    // scene: [Game],
}

const game = new Phaser.Game(config)
