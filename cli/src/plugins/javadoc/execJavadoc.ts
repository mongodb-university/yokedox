import execSh from "exec-sh";
import * as Path from "path";
import { cliSourceDirectory } from "../../cliSourceDirectory.js";
import { PluginArgs } from "../../Plugin.js";
import { JavadocEntityData } from "./index.js";

export type ExecJavadocResult = {
  jsonPath: string;
  overviewPath?: string;
};

/**
  Executes javadoc in the shell with the JSON doclet.
 */
export async function execJavadoc({
  generator,
  generatorArgs,
  debugGeneratorResultPath,
  tempDir,
}: PluginArgs<JavadocEntityData>): Promise<ExecJavadocResult> {
  const overviewPath = findOverviewPath(generatorArgs);

  if (debugGeneratorResultPath !== undefined) {
    return {
      jsonPath: debugGeneratorResultPath,
      overviewPath,
    };
  }

  const docletPath = Path.resolve(
    cliSourceDirectory,
    // TODO: Source from build directory
    "../../plugins/JsonDocletJava8/build/libs/JsonDocletJava8-all.jar"
  );

  const jsonPath = Path.resolve(tempDir, "javadoc");
  const commandLine = [
    generator,
    `-d '${jsonPath}'`,
    `-docletpath '${docletPath}'`,
    "-doclet com.yokedox.JsonDoclet8",
    ...generatorArgs,
  ].join(" ");

  try {
    await execSh.promise(commandLine);
  } catch (error) {
    console.error("Exit code:", (error as { code: number }).code);
    // throw error;
  }
  return { jsonPath, overviewPath };
}

/**
  Extracts the overview path from the given javadoc args string, if provided.

  The overview file is an HTML file that supports some javadoc markup, but it is
  apparently not passed to the doclet.
 */
function findOverviewPath(
  generatorArgs: (string | number)[]
): string | undefined {
  // https://docs.oracle.com/javase/7/docs/technotes/tools/windows/javadoc.html#overview
  const index = generatorArgs.indexOf("-overview");
  if (index === -1) {
    return undefined;
  }
  const overviewPath = generatorArgs[index + 1];
  return typeof overviewPath === "string" ? overviewPath : undefined;
}
