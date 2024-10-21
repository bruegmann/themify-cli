#!/usr/bin/env node

import { Command } from "commander"
import { compile } from "./compile"
import packageJson from "../package.json"
import { bootstrap } from "./bootstrap"

const program = new Command()
    .name("themify")
    .description("helps you to add Bootstrap CSS and customize it")
    .version(
        packageJson.version || "1.0.0",
        "-v, --version",
        "display the version number"
    )
    .addCommand(compile)
    .addCommand(bootstrap)
    .parse(process.argv)

// Show help if no command is provided
if (!process.argv.slice(2).length) {
    program.outputHelp()
}
