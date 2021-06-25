import { strict as assert } from "assert";
import execSh from "exec-sh";
import glob from "glob-promise";
import * as Path from "path";
import * as md from "mdast-builder";
import { promises as fs } from "fs";
import { cliSourceDirectory } from "../../cliSourceDirectory.js";
import { Plugin, PluginArgs } from "../../index.js";
import { ParsedClassDoc, ParsedPackageDoc } from "./doclet8.js";
import { Project } from "../../Project.js";
import { Node } from "../../mdast.js";
import { Page } from "../../Page.js";

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
  const { jsonPath, project } = args;
  // Glob files in jsonPath and open them
  const paths = await glob(Path.join(jsonPath, "/") + "**/*.json");
  const promises = paths.map(async (path) => {
    // Incoming data MUST conform to JSON schema
    // TODO: Could validate again here
    const data = JSON.parse(await fs.readFile(path, "utf8"));
    const { _class } = data;
    switch (_class) {
      case "ParsedClassDoc":
        return processClassDoc(project, data as ParsedClassDoc);
      case "ParsedPackageDoc":
        return processPackageDoc(project, data as ParsedPackageDoc);
      default:
        throw new Error(`Unexpected _class type: ${_class}`);
    }
  });
  await Promise.all(promises);
  await project.finalize();
}

async function processClassDoc(
  project: Project,
  doc: ParsedClassDoc
): Promise<void> {
  const root = md.root([
    md.heading(1, md.text(doc.asString)),
    md.paragraph(md.text(doc.commentText)),
    md.heading(2, md.text("Constructors")),
    md.list(
      "unordered",
      doc.constructors.map((doc) =>
        md.listItem([md.text(doc.qualifiedName), md.text(doc.flatSignature)])
      )
    ),

    md.heading(2, md.text("Nested Class Summary")),
    makeTable(
      ["Modifier and Type", "Class and Description"],
      doc.innerClasses.map((classDoc) => [
        md.text(classDoc.asString),
        md.text(classDoc.qualifiedTypeName), // TODO: Must fetch complete classDoc from another file
      ])
    ),

    md.heading(2, md.text("Field Summary")),
    makeTable(
      ["Modifier and Type", "Field and Description"],
      doc.fields.map((fieldDoc) => [
        md.paragraph([
          md.text(fieldDoc.modifiers),
          md.text(fieldDoc.type.asString),
        ]),
        md.paragraph([
          md.text(fieldDoc.qualifiedName),
          md.text(fieldDoc.commentText),
        ]),
      ])
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
  const path = `/${doc.asString}`;
  project.writePage(new Page(path, root));
}

async function processPackageDoc(
  project: Project,
  doc: ParsedPackageDoc
): Promise<void> {
  // TODO
}

function makeTable(labels: string[], rows: Node[][]) {
  return md.table(
    Array(labels.length).map(() => "left"),
    [
      md.tableRow(labels.map((label) => md.tableCell([md.text(label)]))),
      ...rows.map((row) => {
        assert(
          row.length === labels.length,
          "expected row and label length to match"
        );
        return md.tableRow(row.map((cell) => md.tableCell(cell)));
      }),
    ]
  );
}

/*
function makeMethodDetailNode(doc: MethodDoc): unist.Node {
}}
*/
