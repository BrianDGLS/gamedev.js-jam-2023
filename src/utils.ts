export const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max))

const RADIAN_CONVERSION = 0.01745329

export const degreesToRadians = (degrees: number) => degrees * RADIAN_CONVERSION

export const minuteHandDegree = (minute: number) => minute * 6

export const minuteHandRadians = (minute: number) =>
    degreesToRadians(minuteHandDegree(minute))

export const hourHandDegree = (hour: number) => hour * 30

export const hourHandRadians = (hour: number) =>
    degreesToRadians(hourHandDegree(hour))

export const normalizeHour = (hour: number) => (hour % 24) % 12 || 12

export const incrementHour = (hour: number) =>
    hour === 12 ? 1 : clamp(hour + 1, 0, 12)
export const decrementHour = (hour: number) =>
    hour === 1 ? 12 : clamp(hour - 1, 0, 12)

export const incrementMinute = (minute: number) =>
    minute === 55 ? 0 : clamp(minute + 5, 0, 55)
export const decrementMinute = (minute: number) =>
    minute === 0 ? 55 : clamp(minute - 5, 0, 55)
