import { GameObj } from "kaboom"

export const makeHoverable = (gameObj: GameObj<any>) => {
    gameObj.onUpdate(() => cursor("default"))
    gameObj.onHover(() => cursor("pointer"))
}

export const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max))
