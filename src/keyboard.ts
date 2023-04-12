export class Keyboard {
    public static keys = new Set<string>()

    public static isDown(key: string): boolean {
        return Keyboard.keys.has(key)
    }
}

window.addEventListener("keydown", ({ key }) => Keyboard.keys.add(key))
window.addEventListener("keyup", ({ key }) => Keyboard.keys.delete(key))
