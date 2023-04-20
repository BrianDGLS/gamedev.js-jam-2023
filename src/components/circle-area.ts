export const circleArea = (radius: number) => ({
    id: "circleArea",
    require: ["area", "circle"],
    radius: radius,
    width: radius * 2,
    height: radius * 2,
})
