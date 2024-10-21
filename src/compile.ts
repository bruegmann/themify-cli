import sass from "sass"
import { promises as fs } from "fs"
import { exec } from "child_process"
import util from "util"
import path from "path"
import postcss from "postcss"
// @ts-expect-error
import postcssOnlyVars from "postcss-only-vars"
// @ts-expect-error
import postcssMinify from "postcss-minify"
import autoprefixer from "autoprefixer"
import { Command } from "commander"
import { Style, StyleKey, styleKeys, styles, validateStyle } from "./styles"
import prompts from "prompts"

const execPromise = util.promisify(exec)

const currentDir = process.cwd()
const cliRootDir = path.resolve(__dirname, "..")

export type Options = {
    primary?: string
    output: string
    full?: boolean
    style?: StyleKey
    minify?: boolean
    importBefore?: string
    importAfter?: string
    append?: string
    dependencies?: string[]
    useVersion?: string
}

export function addSharedToCompile(
    command: Command,
    optionDefaultValues?: Options
) {
    return command
        .option(
            "-o, --output <path>",
            "path to output file",
            optionDefaultValues?.output || "output.css"
        )
        .option("-f, --full", "export full CSS, not just the variables")
        .option("-p, --primary <color>", "primary color")
        .option(
            `-s, --style <${styleKeys.join("|")}>`,
            "type of style",
            validateStyle
        )
        .option(
            "--import-before <path>",
            "could be a path to file with custom Sass"
        )
        .option(
            "--import-after <path>",
            "could be a path to a file that overwrites CSS variables"
        )
        .option("--no-minify", "output will not be minified")
        .option("--dependencies <packages>", "set of dependencies to install")
}

export const compile = addSharedToCompile(
    new Command()
        .name("compile")
        .description("creates CSS")
        .argument("[mainScss]", "main SCSS code")
        .action((mainScss, options) => {
            try {
                runCompile(mainScss, options)
            } catch (error: any) {
                console.error(`Error executing command: ${error.message}`)
            }
        })
)

async function installDependencies(dependencies: string[]) {
    const installPromises = dependencies.map(async (dependency) => {
        const installCommand = `npm install --no-save --prefix ${cliRootDir} ${dependency}`

        try {
            const { stderr } = await execPromise(installCommand)
            if (stderr) {
                console.error(`stderr: ${stderr}`)
            }
        } catch (error: any) {
            console.error(`Error during npm install: ${error.message}`)
        }
    })

    await Promise.all(installPromises)
}

async function scssImport(scssFile?: string) {
    if (scssFile) {
        const importBeforePath = path.resolve(currentDir, scssFile)
        return await fs.readFile(importBeforePath, {
            encoding: "utf-8"
        })
    }
    return ""
}

export async function runCompile(
    mainScss: string = "",
    {
        primary,
        output,
        full,
        style: styleKey,
        minify,
        importBefore,
        importAfter,
        append,
        dependencies
    }: Options,
    scssBefore: string = ""
) {
    let style: Style | undefined

    if (!styleKey || styleKey === "") {
        const response = await prompts({
            type: "select",
            name: "style",
            message: "Choose style",
            choices: [
                { title: "Default", value: "" },
                ...styleKeys.map((key) => ({ title: key, value: key }))
            ]
        })

        if (response && response.style && styleKeys.includes(response.style)) {
            styleKey = response.style
        }
    }
    if (styleKey && styleKeys.includes(styleKey)) {
        style = styles[styleKey]
    }

    console.log("Compiling...")

    if (dependencies) {
        await installDependencies(dependencies)
    }

    const outputFilePath = path.resolve(currentDir, output)

    if (styleKey === "new-york") {
        append = `@import url(https://rsms.me/inter/inter.css);

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

    const importBeforeScss = await scssImport(importBefore)
    const importAfterScss = await scssImport(importAfter)

    const scss = `${importBeforeScss}${scssBefore}${
        primary ? `$primary: ${primary};` : ""
    }${style ? style.scss : ""}
    ${mainScss}
    ${importAfterScss}`

    const sassResult = sass.compileString(scss, {
        loadPaths: [cliRootDir]
    })

    const postcssPlugins: postcss.AcceptedPlugin[] = [autoprefixer]

    if (minify) {
        postcssPlugins.push(postcssMinify)
    }

    if (!full) {
        postcssPlugins.push(postcssOnlyVars())
    }

    const result = await postcss(postcssPlugins).process(sassResult.css, {
        from: undefined,
        to: outputFilePath
    })

    if (style?.append) {
        result.css += style.append
    }

    if (append) {
        result.css += append
    }

    await fs.writeFile(outputFilePath, result.css)
    if (result.map) {
        await fs.writeFile(outputFilePath + ".map", result.map.toString())
    }
}
