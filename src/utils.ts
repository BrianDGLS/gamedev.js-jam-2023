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

export const minuteHandDegree = (minute: number) => minute * 6
export const hourHandDegree = (hour: number) => hour * 30
export const normalizeHour = (hour: number) => (hour % 24) % 12 || 12
export const getRandomHour = () => Math.floor(rand(0, 24))
export const getRandomMinute = () => Math.floor(rand(0, 12)) * 5
