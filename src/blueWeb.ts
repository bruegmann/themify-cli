import { Command } from "commander"
import { addSharedToCompile, Options, runCompile } from "./compile"
import prompts from "prompts"

export const blueWeb = addSharedToCompile(
    new Command()
        .name("blue-web")
        .description("creates Blue Web CSS")
        .option("--use-version <version>", "set version of Blue Web", "latest")
        .action((options) => {
            try {
                createTheme(options)
            } catch (error: any) {
                console.error(`Error executing command: ${error.message}`)
            }
        }),
    {
        output: "blue-web.css"
    }
)

export interface ThemeInfo {
    name: string
    account?: string
    link?: string
    customStyle?: string
    variables: { [variable: string]: string }
    blueReactVersion: string
    exportOnlyCssVars: boolean
    includeNeuScss: boolean
    colorMode?: "light" | "dark"
    appearance?: "soft" | "bold"
}

async function createTheme(options: Options) {
    const themeInfo: ThemeInfo = {
        name: "your-theme",
        variables: {},
        blueReactVersion: "latest",
        exportOnlyCssVars: true,
        includeNeuScss: false
    }
    await appearanceHelper(themeInfo)
    const scss = createScss(themeInfo)

    runCompile(
        '@import "node_modules/blue-web/dist/style.scss";',
        {
            ...options,
            dependencies: [
                ...(options.dependencies || []),
                `blue-web@${options.useVersion}`
            ]
        },
        scss
    )
}

const createScss = (themeInfo: ThemeInfo) => {
    let _scss = ""

    if (themeInfo.customStyle) {
        _scss += `${themeInfo.customStyle}\n\n`
    }

    _scss += "// Blue variables\n//\n\n"

    if (themeInfo.variables) {
        Object.keys(themeInfo.variables).forEach((i: string) => {
            if (themeInfo.variables[i] !== "")
                _scss += i + ": " + themeInfo.variables[i] + ";\n"
        })
    }

    return _scss
}

async function appearanceHelper(themeInfo: ThemeInfo) {
    let theme = { h: 220, s: 16, l: 50 }
    let primary = { h: 240, s: 94, l: 50 }
    let gray = { h: 200, s: 10, l: 50 }

    let override = false
    let moreTones = false
    let colorMode: "light" | "dark" = themeInfo.colorMode || "light"
    let appearance: "soft" | "bold" = themeInfo.appearance || "soft"

    const response = await prompts([
        {
            type: "select",
            name: "theme",
            message: "Choose theme colors",
            choices: [
                { title: "zinc", value: { h: 240, s: 9, l: 10 } },
                { title: "slate", value: { h: 222.2, s: 47.4, l: 11.2 } },
                { title: "blue", value: { h: 221.2, s: 83.2, l: 53.3 } }
            ]
        },
        {
            type: "select",
            name: "colorMode",
            message: "Choose color mode",
            choices: [
                { title: "light", value: "light" },
                { title: "dark", value: "dark" }
            ]
        },
        {
            type: "select",
            name: "appearance",
            message: "Choose appearance",
            choices: [
                { title: "soft", value: "soft" },
                { title: "bold", value: "bold" }
            ]
        }
    ])

    if (response) {
        if (response.theme) theme = response.theme
        if (response.colorMode) colorMode = response.colorMode
        if (response.appearance) appearance = response.appearance
    }

    function apply() {
        if (!moreTones) {
            primary.h = theme.h
            primary.s = theme.s
            primary.l = theme.l
            gray.h = theme.h
            gray.s = theme.s
            gray.l = theme.l
        }

        if (override) {
            themeInfo.variables = {}
        }

        themeInfo.variables = {
            ...themeInfo.variables,
            ["$theme"]: `hsl(${theme.h}deg ${theme.s}% 50%)`,
            ["$primary"]: `hsl(${primary.h}deg ${primary.s}% ${
                primary.l || 50
            }%)`,
            ["$white"]: `#fff`,
            ["$gray-100"]: `hsl(${gray.h}deg 17% 90%)`,
            ["$gray-200"]: `hsl(${gray.h}deg 16% 93%)`,
            ["$gray-300"]: `hsl(${gray.h}deg 14% 89%)`,
            ["$gray-400"]: `hsl(${gray.h}deg 14% 83%)`,
            ["$gray-500"]: `hsl(${gray.h}deg 11% 71%)`,
            ["$gray-600"]: `hsl(${gray.h}deg 7% 46%)`,
            ["$gray-700"]: `hsl(${gray.h}deg 9% 31%)`,
            ["$gray-800"]: `hsl(${gray.h}deg 10% 23%)`,
            ["$gray-900"]: `hsl(${gray.h}deg 11% 15%)`,
            ["$black"]: `#000`
        }

        if (appearance === "soft") {
            themeInfo.variables = {
                ...themeInfo.variables,
                ["$theme"]: `hsl(${theme.h}deg ${theme.s}% 94%)`,
                ["$header-color"]: "$gray-900",
                ["$sidebar-color"]: "$gray-900"
            }
        } else {
            delete themeInfo.variables["$theme"]
            delete themeInfo.variables["$header-color"]
            delete themeInfo.variables["$sidebar-color"]
        }

        if (colorMode === "dark") {
            themeInfo.variables = {
                ...themeInfo.variables,
                ["$body-bg"]: "$gray-900",
                ["$body-color"]: "$white"
            }

            if (appearance === "soft") {
                themeInfo.variables = {
                    ...themeInfo.variables,
                    ["$theme"]: `hsl(${theme.h}deg ${theme.s}% 6%)`,
                    ["$header-color"]: "$white",
                    ["$sidebar-color"]: "$white"
                }
            }
        }

        themeInfo.colorMode = colorMode
        themeInfo.appearance = appearance
    }
    apply()
}
