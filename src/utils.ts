export const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max))

const hovered = new Set<number | null>()
export const allowClickable = () => {
    cursor("default")

    onUpdate("clickable", ({ _id }) => {
        if (hovered.has(_id)) {
            cursor("default")
            hovered.delete(_id)
        }
    })

    onHover("clickable", ({ _id }) => {
        cursor("pointer")
        hovered.add(_id)
    })
}
