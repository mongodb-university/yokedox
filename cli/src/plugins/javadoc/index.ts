import { strict as assert } from "assert";
import { promises as fs } from "fs";
import glob from "glob-promise";
import * as md from "mdast-builder";
import * as Path from "path";
import { Plugin, PluginArgs } from "../../index.js";
import { Page } from "../../Page.js";
import { Project } from "../../Project.js";
import { Node } from "../../yokedast.js";
import { buildIndexes, packageToFolderPath } from "./buildIndexes.js";
import { MethodDoc, ParsedClassDoc, ParsedPackageDoc, Type } from "./doclet8.js";
import { execJavadoc, ExecJavadocResult } from "./execJavadoc.js";
import { tagsToMdast } from "./tagsToYokedast.js";

export type JavadocEntityData = {
  category: "class" | "package";
  containingPackage?: string;
  simpleTypeName?: string;
  classType?: ClassType;
};

export type MakeInheritedMethodListArgs = {
  project: Project;
  doc: ParsedClassDoc;
  list: Type[];
  // maps class qualified name to array of method names inherited from that class
  inheritedMethods: Record<string, string[]>;
  // prefix string occurs before each listed item
  prefix: string;
};

type ClassType = "error" | "exception" | "class";

function getClassType(doc: ParsedClassDoc): ClassType {
  if (doc.isError) {
    return "error";
  } else if (doc.isException) {
    return "exception";
  } else {
    return "class";
  }
}

const Javadoc: Plugin<JavadocEntityData> = {
  async run(args): Promise<void> {
    const { project } = args;
    // Handle external entities
    project.addEntityTransformer((canonicalName) => {
      if (!/^java\./.test(canonicalName)) {
        return undefined;
      }
      const path = canonicalName.split(".").join("/");
      return {
        type: "external",
        canonicalName,
        pageUri: `https://docs.oracle.com/javase/7/docs/api/${path}.html`,
      };
    });

    // Handle built-in entities
    project.addEntityTransformer((canonicalName) => {
      if (
        ![
          // https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html
          "boolean",
          "byte",
          "char",
          "double",
          "float",
          "int",
          "long",
          "short",
          "void",
        ].includes(canonicalName)
      ) {
        return undefined;
      }
      return {
        type: "builtIn",
        canonicalName,
        pageUri: "",
      };
    });

    // 1. Run javadoc with JSON doclet to produce JSON files in temporary
    //    directory OR consume existing files at debugGeneratorResultPath
    const javadocResult = await execJavadoc(args);
    // 2. Consume JSON files and produce Yokedox entities
    const { jsonPath, overviewPath } = javadocResult;
    await processJson({ ...args, jsonPath });
    // 3. Build indexes and additional pages
    const finalizedProject = await args.project.finalize();
    await buildIndexes({ finalizedProject, overviewPath });
  },
};

export default Javadoc;

/**
  Process the JSON files generated by the doclet.
 */
async function processJson(
  args: PluginArgs<JavadocEntityData> & ExecJavadocResult
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
}

function getTitle(doc: ParsedClassDoc): string {
  let type = ""
  if (doc.isInterface) {
    type = "Interface "
  } else if (doc.isClass) {
    type = "Class "
  } else if (doc.isEnum) {
    type = "Enum "
  } else if (doc.isException) {
    type = "Exception "
  }
  return `${type}${doc.name}`;
}

async function processClassDoc(
  project: Project<JavadocEntityData>,
  doc: ParsedClassDoc
): Promise<void> {
  const pageUri = `/${packageToFolderPath(doc.qualifiedTypeName)}`;
  const root = md.root(
    makeSection({
      project,
      pageUri,
      doc,
      depth: 1,
      title: md.text(getTitle(doc)),
      makeBody: makeClassDocPageBody,
    })
  );
  project.writePage(new Page(pageUri, root));

  // write packages on the fly, as we find classes that belong to them
  project.declareEntity({
    canonicalName: doc.containingPackage.name,
    pageUri: doc.containingPackage.name,
    data: {
      category: "package",
    },
  });
}

async function processPackageDoc(
  project: Project<JavadocEntityData>,
  doc: ParsedPackageDoc
): Promise<void> {
  // Nothing here because parsed package docs are not comprehensive. Instead, we
  // identify packages as we process classes.
}

function makeTable(labels: string[], rows: (Node | Node[])[][]) {
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

function makeSuperclassList(project: Project, doc: ParsedClassDoc) {
  const { superclasses } = doc;
  if (superclasses == null) {
    return [];
  }
  return [
    md.emphasis(md.text("Superclass:")),
    md.paragraph([
      md.list(
        "unordered",
        superclasses.map((superclassType) => {
          const { qualifiedTypeName } = superclassType;
          return md.listItem(project.linkToEntity(qualifiedTypeName));
        })
      ),
    ]),
  ];
}

function makeInheritedMethodList(args: MakeInheritedMethodListArgs) {
  if (args.list.length === 0) {
    return [];
  }
  return [
    md.list(
      "unordered",
      args.list.map((interfaceType) => {
        return [
          md.listItem(
            [
              md.text(args.prefix), args.project.linkToEntity(interfaceType.qualifiedTypeName), md.text(": "), md.paragraph(),
              md.paragraph([md.text(args.inheritedMethods[interfaceType.qualifiedTypeName].join(", "))])
            ]
          )
        ]
      }).flat(1))
  ]
}

function makeImplementedInterfacesList(project: Project, doc: ParsedClassDoc) {
  const { interfaceTypes } = doc;
  if (interfaceTypes.length === 0) {
    return [];
  }
  return [
    md.paragraph(md.emphasis(md.text("Implemented interfaces:"))),
    md.list(
      "unordered",
      interfaceTypes.map(({ qualifiedTypeName }) =>
        md.listItem(project.linkToEntity(qualifiedTypeName))
      )
    ),
  ];
}

type MakeBodyFunction<DocType = ParsedClassDoc> = (
  args: MakeSectionArgs<DocType>
) => Node[] | Node;

type MakeSectionArgs<DocType> = {
  project: Project<JavadocEntityData>;
  pageUri: string;
  doc: DocType;
  title: string | Node | Node[];
  depth: number;
  shouldMakeSection?(args: MakeSectionArgs<DocType>): boolean;
  makeBody: MakeBodyFunction<DocType>;
};

function makeSection<DocType>(args: MakeSectionArgs<DocType>): Node[] {
  const { shouldMakeSection, depth, title, makeBody } = args;
  if (shouldMakeSection !== undefined && !shouldMakeSection(args)) {
    return [];
  }
  return [
    md.heading(depth, typeof title === "string" ? md.text(title) : title),
    ...[makeBody(args)].flat(1),
  ];
}

const makeClassDocPageBody: MakeBodyFunction = (args) => {
  const { project, doc, pageUri } = args;
  const depth = args.depth + 1;
  return [
    // Declare the class itself as an entity
    project.declareEntity({
      canonicalName: doc.qualifiedTypeName,
      pageUri,
      data: {
        category: "class",
        containingPackage: doc.containingPackage.name,
        simpleTypeName: doc.name,
        classType: getClassType(doc),
      },
    }),

    // package
    md.paragraph([md.emphasis(md.text("Package")), md.text(" "), md.inlineCode(doc.containingPackage.name)]),

    // Class hierarchy
    ...makeSuperclassList(project, doc),

    // Implemented interfaces
    ...makeImplementedInterfacesList(project, doc),

    // Comment body
    tagsToMdast(project, doc.inlineTags),

    ...makeSection({
      ...args,
      depth,
      title: "Constructors",
      shouldMakeSection: () => doc.constructors.length !== 0,
      makeBody: () =>
        md.list(
          "unordered",
          doc.constructors.map((doc) =>
            md.listItem([md.inlineCode(doc.qualifiedName + doc.flatSignature)])
          )
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Nested Class Summary",
      shouldMakeSection: () => doc.innerClasses.length !== 0,
      makeBody: () =>
        makeTable(
          ["Modifier and Type", "Class and Description"],
          doc.innerClasses.map((classDoc) => [
            md.inlineCode(classDoc.modifiers ?? ""),
            md.inlineCode(classDoc.qualifiedTypeName), // TODO: Must fetch complete classDoc from another file
          ])
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Field Summary",
      shouldMakeSection: () => doc.fields.length !== 0,
      makeBody: () =>
        makeTable(
          ["Modifier and Type", "Field and Description"],
          doc.fields.map((fieldDoc) => [
            md.paragraph([
              md.inlineCode(fieldDoc.modifiers + fieldDoc.type.asString),
            ]),
            [
              md.paragraph(md.inlineCode(fieldDoc.name)),
              md.text(fieldDoc.commentText),
            ],
          ])
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Enum Constant Summary",
      shouldMakeSection: () => doc.enumConstants.length !== 0,
      makeBody: () =>
        makeTable(
          ["Enum Constant", "Description"],
          doc.enumConstants.map((doc) => [
            [project.linkToEntity(doc.qualifiedName, doc.name)],
            [md.paragraph(tagsToMdast(project, doc.firstSentenceTags))],
          ])
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Method Summary",
      shouldMakeSection: () => doc.methods.length !== 0,
      makeBody: () =>
        makeTable(
          ["Modifier and Type", "Method and Description"],
          doc.methods.map((doc) => [
            [
              md.text(doc.modifiers),
              md.text(" "),
              project.linkToEntity(
                doc.returnType.qualifiedTypeName,
                doc.returnType.typeName
              ),
            ],
            [
              md.paragraph([
                project.linkToEntity(getCanonicalNameForMethod(doc), doc.name),
                md.text(" "),
                ...makeTypeParameterListWithLinks(project, doc),
                ...makeParameterListWithLinks(project, doc),
              ]),
              md.paragraph(tagsToMdast(project, doc.firstSentenceTags)),
            ],
          ])
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Inherited Methods",
      shouldMakeSection: () => Object.keys(doc.inheritedMethods).length !== 0,
      makeBody: () =>
        makeInheritedMethodList({
          project,
          doc,
          list: doc.superclasses,
          inheritedMethods: doc.inheritedMethods,
          prefix: "Methods inherited from interface "
        }),
        ...makeInheritedMethodList({
          project,
          doc,
          list: doc.interfaceTypes,
          inheritedMethods: doc.inheritedMethods,
          prefix: "Methods inherited from class "
        })
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Field Detail",
      shouldMakeSection: () => doc.fields.length !== 0,
      makeBody: () =>
        doc.fields
          .map((doc) => [
            project.declareEntity({
              canonicalName: doc.qualifiedName,
              pageUri,
            }),
            md.heading(3, md.inlineCode(doc.name)),
            tagsToMdast(project, doc.inlineTags),
          ])
          .flat(1),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Enum Constant Detail",
      shouldMakeSection: () => doc.enumConstants.length !== 0,
      makeBody: () =>
        doc.enumConstants
          .map((doc) => [
            project.declareEntity({
              canonicalName: doc.qualifiedName,
              pageUri,
            }),
            md.heading(3, md.inlineCode(doc.name)),
            md.paragraph([
              md.text(doc.modifiers),
              md.text(" "),
              project.linkToEntity(
                doc.type.qualifiedTypeName,
                doc.type.typeName
              ),
            ]),
            md.paragraph(md.text(doc.commentText)),
          ])
          .flat(1),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Method Detail",
      shouldMakeSection: () => doc.methods.length !== 0,
      makeBody: makeMethodDetailBody,
    }),
  ];
};

const getCanonicalNameForMethod = (doc: MethodDoc): string => {
  return `${doc.qualifiedName}${doc.flatSignature}`;
};

const makeParameterListWithLinks = (
  project: Project<JavadocEntityData>,
  doc: MethodDoc
): Node[] => {
  return [
    md.text("("),
    ...doc.parameters
      .map((parameter, i) => [
        project.linkToEntity(
          parameter.type.qualifiedTypeName,
          parameter.typeName
        ),
        md.text(
          ` ${parameter.name ?? ""}${i < doc.parameters.length - 1 ? ", " : ""}`
        ),
      ])
      .flat(1),
    md.text(")"),
  ];
};

const makeTypeParameterListWithLinks = (
  project: Project<JavadocEntityData>,
  doc: MethodDoc
): Node[] => {
  if (doc.typeParameters.length === 0) {
    return [];
  }
  return [
    md.text("<"),
    ...doc.typeParameters
      .map((parameter, i) => [
        project.linkToEntity(parameter.qualifiedTypeName, parameter.typeName),
        md.text(
          ` ${parameter.name ?? ""}${
            i < doc.typeParameters.length - 1 ? ", " : ""
          }`
        ),
      ])
      .flat(1),
    md.text(">"),
  ];
};

/**
  Makes a method detail body with all overloads of a method grouped in the same
  section.
 */
const makeMethodDetailBody: MakeBodyFunction = (args) => {
  const { depth, doc } = args;
  const methodsGroupedByName = Array.from(
    doc.methods
      .reduce((methodsByName, methodDoc) => {
        const overloads = methodsByName.get(methodDoc.name) ?? [];
        overloads.push(methodDoc);
        methodsByName.set(methodDoc.name, overloads);
        return methodsByName;
      }, new Map<string, MethodDoc[]>())
      .entries()
  );
  return methodsGroupedByName
    .map(([methodName, overloadDocs]) =>
      makeSection({
        ...args,
        depth: depth + 1,
        title: methodName,
        doc: overloadDocs,
        shouldMakeSection: () => true,
        makeBody: makeMethodOverloadsDetailBody,
      })
    )
    .flat(1);
};

const makeMethodOverloadsDetailBody: MakeBodyFunction<MethodDoc[]> = (args) => {
  const { project, pageUri, depth, doc: overloadDocs } = args;
  return overloadDocs
    .map((doc) => {
      const canonicalName = getCanonicalNameForMethod(doc);
      return [
        project.declareEntity({
          canonicalName,
          pageUri,
        }),
        md.heading(depth + 1, [
          md.text(doc.modifiers),
          md.text(" "),
          project.linkToEntity(
            doc.returnType.qualifiedTypeName,
            doc.returnType.typeName
          ),
          md.text(` ${doc.name} `),
          ...makeTypeParameterListWithLinks(project, doc),
          ...makeParameterListWithLinks(project, doc),
        ]),
        tagsToMdast(project, doc.inlineTags),

        // Type parameters section
        ...makeSection({
          ...args,
          depth: depth + 2,
          title: "Type Parameters",
          shouldMakeSection: () => doc.typeParamTags.length !== 0,
          makeBody: () => {
            return md.list(
              "unordered",
              doc.typeParamTags.map((tag) => {
                return md.listItem([
                  md.inlineCode(`${tag.parameterName} - `),
                  tagsToMdast(project, tag.inlineTags ?? []),
                ]);
              })
            );
          },
        }),

        // Parameters section
        ...makeSection({
          ...args,
          depth: depth + 2,
          title: "Parameters",
          shouldMakeSection: () => doc.paramTags.length !== 0,
          makeBody: () => {
            return md.list(
              "unordered",
              doc.paramTags.map((paramTag) => {
                return md.listItem([
                  md.inlineCode(`${paramTag.parameterName} - `),
                  tagsToMdast(project, paramTag.inlineTags ?? []),
                ]);
              })
            );
          },
        }),

        // Returns section
        ...makeSection({
          ...args,
          depth: depth + 2,
          title: "Returns",
          shouldMakeSection: () =>
            doc.tags.filter((tag) => /^returns?$/.test(tag.name)).length !== 0,
          makeBody: () => {
            const returnTag = doc.tags.find((tag) =>
              /^returns?$/.test(tag.name)
            );
            assert(returnTag !== undefined);
            return md.paragraph(
              tagsToMdast(project, returnTag.inlineTags ?? [])
            );
          },
        }),

        // "Throws" section
        ...makeSection({
          ...args,
          depth: depth + 2,
          title: "Throws",
          shouldMakeSection: () => doc.throwsTags.length !== 0,
          makeBody: () => {
            // TODO
            return [];
            /*
                  return md.list(
                    "unordered",
                    doc.throwsTags.map((tag) => {
                      return md.listItem([
                        project.linkToEntity(
                          tag.exceptionType?.qualifiedTypeName,
                          tag.exceptionName
                        ),
                        md.text(" - "),
                        tagsToMdast(project, tag.inlineTags ?? []),
                      ]);
                    })
                  );
                  */
          },
        }),

        // "See also" section
        ...makeSection({
          ...args,
          depth: depth + 2,
          title: "See Also",
          shouldMakeSection: () => doc.seeTags.length !== 0,
          makeBody: () => {
            return doc.seeTags.map((tag) => {
              return md.paragraph(md.text(tag.text));
            });
          },
        }),
      ];
    })
    .flat(1);
};
