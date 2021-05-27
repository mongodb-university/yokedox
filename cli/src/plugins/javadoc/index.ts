import execSh from "exec-sh";
import glob from "glob-promise";
import * as Path from "path";
import * as md from "mdast-builder";
import * as unist from "unist";
import stringify from "remark-stringify";
import unified from "unified";
import { promises as fs } from "fs";
import { Plugin, PluginArgs } from "../..";
import { MethodDoc, ParsedClassDoc, ParsedPackageDoc } from "./doclet8";

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
    // TODO: Source from build directory
    "../../../../plugins/JsonDocletJava8/build/libs/JsonDocletJava8-all.jar"
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
    console.error("Exit code:", error.code);
    // throw error;
  }
  return { jsonPath };
}

/**
  Process the JSON files generated by the doclet.
 */
async function processJson(
  args: PluginArgs & ExecJavadocResult
): Promise<void> {
  const { jsonPath } = args;
  // Glob files in jsonPath and open them
  const paths = await glob(Path.join(jsonPath, "/") + "**/*.json");
  const promises = paths.map(async (path) => {
    // Incoming data MUST conform to JSON schema
    // TODO: Could validate again here
    const data = JSON.parse(await fs.readFile(path, "utf8"));
    const { _class } = data;
    switch (_class) {
      case "ParsedClassDoc":
        return processClassDoc(args, data as ParsedClassDoc);
      case "ParsedPackageDoc":
        return processPackageDoc(args, data as ParsedPackageDoc);
      default:
        throw new Error(`Unexpected _class type: ${_class}`);
    }
  });
  await Promise.all(promises);
}

const processor = unified().use(stringify, {
  bullet: "-",
  fence: "`",
  fences: true,
  incrementListMarker: false,
});

async function processClassDoc(
  { onEntity, onPage }: PluginArgs,
  doc: ParsedClassDoc
): Promise<void> {
  const mdast = md.root([
    md.heading(1, md.text(doc.asString)),
    md.paragraph(md.text(doc.commentText)),
    md.heading(2, md.text("Constructors")),
    md.list(
      "unordered",
      doc.constructors.map((doc) =>
        md.listItem([md.text(doc.qualifiedName), md.text(doc.flatSignature)])
      )
    ),
    md.heading(2, md.text("Public Methods")),
    md.list(
      "unordered",
      doc.methods
        .filter((doc) => doc.isPublic)
        .map((doc) =>
          md.listItem([
            md.text(doc.name),
            md.text(doc.flatSignature),
            md.paragraph(md.text(doc.commentText)),
          ])
        )
    ),
  ]);
  console.log(processor.stringify(mdast));
}

async function processPackageDoc(
  args: PluginArgs,
  doc: ParsedPackageDoc
): Promise<void> {
  // TODO
}

function makeMethodDetailNode(doc: MethodDoc): unist.Node {}
