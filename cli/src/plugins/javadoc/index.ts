import execSh from "exec-sh";
import * as Path from "path";
import { Plugin, PluginArgs } from "../..";

const Javadoc: Plugin = {
  async run(args): Promise<void> {
    // 1. Run javadoc with JSON doclet to produce JSON files in temporary directory
    const { jsonPath } = await execJavadoc(args);
    // 2. Consume JSON files and produce Yokedox entities
    await processJson({ ...args, jsonPath });
  },
};

export default Javadoc;

type ExecJavadocResult = {
  jsonPath: string;
};

/**
  Executes javadoc in the shell with the JSON doclet.
 */
async function execJavadoc({
  generator,
  generatorArgs,
  tempDir,
}: PluginArgs): Promise<ExecJavadocResult> {
  const docletPath = Path.resolve(
    __dirname,
    "../../../plugins/JsonDocletJava8/build/libs/JsonDocletJava8-all.jar"
  );

  const jsonPath = Path.resolve(tempDir, "javadoc");
  const commandLine = [
    generator,
    `-d '${jsonPath}'`,
    `-docletpath '${docletPath}'`,
    "-doclet com.yokedox.JsonDoclet8",
    ...generatorArgs,
  ].join(" ");
  console.log("Command:", commandLine);
  // Will throw on failed command
  await execSh.promise(commandLine);
  return { jsonPath };
}

async function processJson({
  onEntity,
  onPage,
  jsonPath,
}: PluginArgs & ExecJavadocResult): Promise<void> {
  // 1. Glob files in jsonPath and open them
  // 2. Process each file to produce entities and pages
}
