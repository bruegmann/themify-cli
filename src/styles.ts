import { InvalidArgumentError } from "commander"
import fs from "fs"
import path from "path"

// function loadStyle(name: string) {
//     return fs.readFileSync(
//         path.resolve(__dirname, "..", "styles", `${name}.scss`),
//         { encoding: "utf-8" }
//     )
// }

// const stylesDirectory = path.resolve(__dirname, "..", "styles")

export interface Style {
    slug: string
    scss: string
    append?: string
}

export const styles: Record<string, Style> = {
    "new-york": {
        slug: "new-york",
        scss: /* scss */ `// Inspired by shadcn/ui "New York"

$font-family-sans-serif: #{var(--ny-font-family)} !default;

$primary: hsl(240 5.9% 10%) !default;
$font-size-root: 14px;

$focus-ring-width: 1px !default;
$focus-ring-opacity: 0.5 !default;
`,
        append: /* css */ `@import url(https://rsms.me/inter/inter.css);

:root {
    --ny-font-family: Inter, sans-serif;
    font-feature-settings: "liga" 1, "calt" 1; /* fix for Chrome */
    font-size: 14px;
}
@supports (font-variation-settings: normal) {
    :root {
        --ny-font-family: InterVariable, sans-serif;
    }
}`
    }
}

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
