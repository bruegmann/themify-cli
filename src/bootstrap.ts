import { Command } from "commander"
import { addSharedToCompile, runCompile } from "./compile"

export const bootstrap = addSharedToCompile(
    new Command()
        .name("bootstrap")
        .description("creates Bootstrap CSS")
        .option("--use-version <version>", "set version of Bootstrap", "latest")
        .action((options) => {
            try {
                runCompile(
                    '@import "node_modules/bootstrap/scss/bootstrap.scss";',
                    {
                        ...options,
                        dependencies: [
                            ...(options.dependencies || []),
                            `bootstrap@${options.useVersion}`
                        ]
                    }
                )
            } catch (error: any) {
                console.error(`Error executing command: ${error.message}`)
            }
        }),
    {
        output: "bootstrap.css"
    }
)
