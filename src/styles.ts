import { InvalidArgumentError } from "commander"
import fs from "fs"
import path from "path"

function loadStyle(name: string) {
    return fs.readFileSync(
        path.resolve(__dirname, "..", "styles", `${name}.scss`),
        { encoding: "utf-8" }
    )
}

const stylesDirectory = path.resolve(__dirname, "..", "styles")
export let styles: Record<string, string> = {}

fs.readdirSync(stylesDirectory).forEach((file) => {
    if (file.endsWith(".scss")) {
        const styleName = path.basename(file, ".scss")
        styles[styleName] = loadStyle(styleName)
    }
})
export type StyleKey = keyof typeof styles
export const styleKeys = Object.keys(styles) as StyleKey[]

// Validierungsfunktion für die style-Option
export function validateStyle(value: string): StyleKey {
    if (!styleKeys.includes(value as StyleKey)) {
        throw new InvalidArgumentError(
            `Invalid style. Allowed values are: ${styleKeys.join(", ")}`
        )
    }
    return value as StyleKey
}
