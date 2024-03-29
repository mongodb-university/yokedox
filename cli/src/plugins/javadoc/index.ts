import { strict as assert } from "assert";
import { promises as fs } from "fs";
import glob from "glob-promise";
import * as md from "mdast-builder";
import * as Path from "path";
import { addExternalEntityPattern } from "../../addExternalEntityTransformer.js";
import { Plugin, PluginArgs } from "../../index.js";
import { Page } from "../../Page.js";
import { Project } from "../../Project.js";
import {
  literalIndentationBlock,
  LiteralIndentationBlockNode,
  literalIndentationNode,
  Node,
  seealso,
} from "../../yokedast.js";
import { buildIndexes, packageToFolderPath } from "./buildIndexes.js";
import {
  AnyType,
  ExecutableMemberDoc,
  MethodDoc,
  ParsedClassDoc,
  ParsedPackageDoc,
  SeeTag,
  Type,
} from "./doclet8.js";
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

export type MakeFunctionDeclarationArgs = {
  project: Project<JavadocEntityData>;
  doc: MethodDoc | ExecutableMemberDoc;
  modifiers: boolean;
  returnType: boolean;
};

type EntityType =
  | "error"
  | "exception"
  | "class"
  | "enum"
  | "interface"
  | "annotation type";

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

export function getType(doc: ParsedClassDoc): EntityType {
  if (doc.isError) {
    return "error";
  } else if (doc.isException) {
    return "exception";
  } else if (doc.isEnum) {
    return "enum";
  } else if (doc.isInterface) {
    return "interface";
  } else if (doc.isAnnotationType) {
    return "annotation type";
  } else {
    return "class";
  }
}

export function capitalize(str: string): string {
  if (str.length < 1) {
    return "";
  } else if (str.split(" ").length > 1) {
    return str
      .split(" ")
      .map((s) => capitalize(s))
      .join(" ");
  } else {
    return str[0].toUpperCase() + str.slice(1);
  }
}

const Javadoc: Plugin<JavadocEntityData> = {
  async run(args): Promise<void> {
    const { project, indexPathPrefix } = args;
    // Handle standard external entities
    addExternalEntityPattern(project, {
      from: /^java\./,
      toPrefix: "https://docs.oracle.com/javase/7/docs/api/",
      toSuffix: ".html",
    });

    addExternalEntityPattern(project, {
      from: /^android\./,
      toPrefix: "https://developer.android.com/reference/",
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
    await buildIndexes({ finalizedProject, overviewPath, indexPathPrefix });
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

function processParam(param: AnyType): string {
  if (param.asString.includes(" extends ")) {
    const name = param.asString.split(".");
    return name[name.length - 1];
  } else if (param.dimension == "[]") {
    return param.simpleTypeName + "...";
  }
  return param.simpleTypeName;
}

function getTitle(doc: ParsedClassDoc): string {
  return `${capitalize(getType(doc))} ${doc.name}`;
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
  doc; // unused
  project;
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

function makeDetail(method: Node[], detail: Node | Node[]) {
  return md.table(
    Array(method.length).map(() => "left"),
    [md.tableRow(md.tableCell(method)), md.tableRow(md.tableCell(detail))]
  );
}

function makeSeeAlso(project: Project, tags: SeeTag[]) {
  if (tags.length === 0) {
    return [];
  }
  return [
    seealso(
      md.paragraph(
        md.list(
          "unordered",
          tags.map((tag) => md.listItem(tagsToMdast(project, [tag])))
        )
      ).children
    ),
  ];
}

function makeSuperclassList(project: Project, doc: ParsedClassDoc) {
  const { superclasses } = doc;
  if (superclasses.length === 0) {
    return [];
  }
  return [
    md.paragraph([
      ...doc.superclasses
        .reverse() // superclasses should go simplest to most complex
        .map((superclassType, index) => [
          md.text("\n | " + Array(index * 3).join("\t")), // indent each index 3 spaces more to create a tiered hierarchy
          project.linkToEntity(superclassType.qualifiedTypeName),
        ])
        .flat(1),
      md.text(
        "\n | " +
          Array(doc.superclasses.length * 3).join("\t") +
          doc.qualifiedName +
          "\n"
      ),
    ]),
  ];
}

function makeInheritedMethodList(args: MakeInheritedMethodListArgs) {
  // some inherited-from classes can pass on NO methods. This looks silly. Omit them from the inherited method list.
  const typesWithInheritedMethods = args.list.filter(
    (type) => args.inheritedMethods[type.qualifiedTypeName].length > 0
  );
  if (typesWithInheritedMethods.length === 0) {
    return [];
  }
  return [
    md.list(
      "unordered",
      typesWithInheritedMethods
        .map((type) => {
          return [
            md.listItem(
              [
                md.text(args.prefix),
                args.project.linkToEntity(type.qualifiedTypeName),
                md.text(": "),
                args.inheritedMethods[type.qualifiedTypeName]
                  .map((method, index) => {
                    return [
                      md.inlineCode(method),
                      // separate method names with commas, while avoiding trailing comma
                      index <
                      args.inheritedMethods[type.qualifiedTypeName].length - 1
                        ? md.text(", ")
                        : md.text(""),
                    ];
                  })
                  .flat(1),
              ].flat(1)
            ),
          ];
        })
        .flat(1)
    ),
  ];
}

function makeImplementedInterfacesList(project: Project, doc: ParsedClassDoc) {
  const { interfaceTypes } = doc;
  if (interfaceTypes.length === 0) {
    return [];
  }
  return [
    md.paragraph(md.strong(md.text("Implemented interfaces:"))),
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

  // sort properties of class so users have a predictable scan order
  doc.methods.sort((a, b) => (a.name > b.name ? 1 : -1));
  doc.enumConstants.sort((a, b) => (a.name > b.name ? 1 : -1));
  doc.fields.sort((a, b) => (a.name > b.name ? 1 : -1));
  doc.elements?.sort((a, b) => (a.name > b.name ? 1 : -1));

  // remove protected constructors and fields
  doc.constructors = doc.constructors.filter(
    (doc) => !doc.modifiers.startsWith("protected")
  );
  doc.fields = doc.fields.filter(
    (fieldDoc) => !fieldDoc.modifiers.startsWith("protected")
  );

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
    md.heading(depth, md.text(`${doc.containingPackage.name}`)),

    // Class hierarchy
    ...makeSuperclassList(project, doc),

    // Implemented interfaces
    ...makeImplementedInterfacesList(project, doc),

    // Enclosing class
    doc.containingClass != null
      ? md.paragraph([
          md.text("\n\n"),
          md.strong(md.text("Enclosing class:")),
          md.text("\n\n"),
          project.linkToEntity(
            doc.containingClass.qualifiedTypeName,
            doc.containingClass.simpleTypeName
          ),
          md.text("\n\n"),
        ])
      : md.text(""),

    // Comment body
    tagsToMdast(project, doc.inlineTags),

    // See Also
    ...makeSeeAlso(project, doc.seeTags),

    ...makeSection({
      ...args,
      depth,
      title: "Constructors",
      shouldMakeSection: () => doc.constructors.length !== 0,
      makeBody: () =>
        makeTable(
          ["Constructor and Description"],
          doc.constructors.map((doc) => [
            [
              makeFunctionDeclaration({
                project,
                doc,
                modifiers: false,
                returnType: false,
              }),
              md.paragraph(tagsToMdast(project, doc.firstSentenceTags)),
            ],
          ])
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
            [md.inlineCode(classDoc.modifiers ?? "")],
            [
              project.linkToEntity(
                classDoc.qualifiedTypeName,
                classDoc.typeName
              ),
              md.text("\n"),
              // TODO: Fetch description from inline tags of nested class doc
            ],
          ])
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Optional Element Summary",
      shouldMakeSection: () =>
        doc.elements != null && doc.elements.length !== 0,
      makeBody: () =>
        makeTable(
          ["Modifier and Type", "Optional Element and Description"],
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          doc.elements!.map((elem) => [
            md.paragraph([
              md.text(`${elem.modifiers} `),
              project.linkToEntity(
                elem.returnType.qualifiedTypeName,
                elem.returnType.typeName
              ),
            ]),
            [md.paragraph(tagsToMdast(project, elem.firstSentenceTags))],
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
              md.text(`${fieldDoc.modifiers} `),
              project.linkToEntity(
                fieldDoc.type.qualifiedTypeName,
                fieldDoc.type.typeName
              ),
            ]),
            [
              md.paragraph(
                project.linkToEntity(fieldDoc.qualifiedName, fieldDoc.name)
              ),
              tagsToMdast(project, fieldDoc.inlineTags),
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
          ["Enum Constant and Description"],
          doc.enumConstants.map((doc) => [
            [
              project.linkToEntity(doc.qualifiedName, doc.name),
              md.text("\n\n"),
              md.paragraph(tagsToMdast(project, doc.firstSentenceTags)),
            ],
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
              makeFunctionDeclaration({
                project,
                doc,
                modifiers: false,
                returnType: false,
              }),
              md.paragraph(tagsToMdast(project, doc.firstSentenceTags)),
            ],
          ])
        ),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Inherited Methods",
      shouldMakeSection: () =>
        Object.keys(doc.inheritedMethods).length !== 0 &&
        !doc.isAnnotationType &&
        !doc.isAnnotationTypeElement,
      makeBody: () =>
        makeInheritedMethodList({
          project,
          doc,
          list: doc.superclasses,
          inheritedMethods: doc.inheritedMethods,
          prefix: "Methods inherited from class ",
        }),
      ...makeInheritedMethodList({
        project,
        doc,
        list: doc.interfaceTypes,
        inheritedMethods: doc.inheritedMethods,
        prefix: "Methods inherited from interface ",
      }),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Element Detail",
      shouldMakeSection: () =>
        doc.elements != undefined && doc.elements.length !== 0,
      makeBody: makeElementDetailBody,
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
            ...makeSeeAlso(project, doc.seeTags),
            md.text("\n\n"),
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
            md.text("\n"),
            project.declareEntity({
              canonicalName: doc.qualifiedName,
              pageUri,
            }),
            project.declareEntity({
              canonicalName: `${doc.containingClass?.typeName}.${doc.name}`,
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
            tagsToMdast(project, doc.inlineTags),
            md.text("\n\n"),
          ])
          .flat(1),
    }),

    ...makeSection({
      ...args,
      depth,
      title: "Constructor Detail",
      shouldMakeSection: () => doc.constructors.length !== 0,
      makeBody: makeConstructorDetailBody,
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

function makeFunctionDeclaration(
  args: MakeFunctionDeclarationArgs
): LiteralIndentationBlockNode {
  const { project, doc } = args;
  const noParams = doc.parameters.length === 0;
  return literalIndentationBlock([
    literalIndentationNode(
      1,
      [
        args.modifiers
          ? [md.text(args.doc.modifiers), md.text(" ")]
          : md.text(""),
        args.returnType
          ? [
              project.linkToEntity(
                (doc as MethodDoc).returnType.qualifiedTypeName,
                (doc as MethodDoc).returnType.typeName
              ),
              md.text(" "),
            ]
          : md.text(""),
        project.linkToEntity(doc.qualifiedName, doc.name),
        ...makeTypeParameterListWithLinks(project, doc as MethodDoc),
        md.text("("),
        noParams ? md.text(")") : md.text(""),
      ].flat(1)
    ),
    ...makeParameterListWithLinks(args.project, args.doc).map((param) =>
      literalIndentationNode(2, param)
    ),
    literalIndentationNode(1, [noParams ? md.text("") : md.text(")")]),
  ]);
}

const makeParameterListWithLinks = (
  project: Project<JavadocEntityData>,
  doc: MethodDoc | ExecutableMemberDoc
): Node[][] => {
  return doc.parameters.map((parameter, i) => [
    project.linkToEntity(parameter.type.qualifiedTypeName, parameter.typeName),
    md.text(
      ` ${parameter.name ?? ""}${i < doc.parameters.length - 1 ? ", " : ""}`
    ),
  ]);
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
      [
        args.project.declareEntity({
          canonicalName: methodName,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${methodName}()`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${doc.simpleTypeName}.${methodName}`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${doc.simpleTypeName}.${methodName}()`,
          pageUri: args.pageUri,
        }),
        doc.simpleTypeName !== doc.name
          ? args.project.declareEntity({
              canonicalName: `${doc.name}.${overloadDocs[0].name}`,
              pageUri: args.pageUri,
            })
          : md.text(""),
        doc.simpleTypeName !== doc.name
          ? args.project.declareEntity({
              canonicalName: `${doc.name}.${overloadDocs[0].name}()`,
              pageUri: args.pageUri,
            })
          : md.text(""),
        args.project.declareEntity({
          canonicalName: `${overloadDocs[0].qualifiedName}`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${overloadDocs[0].qualifiedName}()`,
          pageUri: args.pageUri,
        }),
        makeSection({
          ...args,
          depth: depth + 1,
          title: methodName,
          doc: overloadDocs,
          shouldMakeSection: () => true,
          makeBody: makeMethodOverloadsDetailBody,
        }),
        md.text("\n\n"),
      ].flat(1)
    )
    .flat(1);
};

const makeConstructorDetailBody: MakeBodyFunction = (args) => {
  const { project, doc } = args;
  return doc.constructors
    .map((constructor) =>
      [
        args.project.declareEntity({
          canonicalName: constructor.name,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${constructor.name}()`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${constructor.qualifiedName}`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${constructor.qualifiedName}()`,
          pageUri: args.pageUri,
        }),
        makeDetail(
          [
            makeFunctionDeclaration({
              project,
              doc: constructor,
              modifiers: true,
              returnType: false,
            }),
          ],
          [
            tagsToMdast(args.project, constructor.inlineTags),

            md.paragraph(),
            // Type Parameters section
            constructor.typeParamTags.length !== 0
              ? md.paragraph([
                  md.strong(md.text("Type Parameters")),
                  md.list(
                    "unordered",
                    constructor.typeParamTags.map((tag) => {
                      return md.listItem([
                        md.paragraph([
                          md.inlineCode(`${tag.parameterName}`),
                          md.text("- "),
                          tagsToMdast(args.project, tag.inlineTags ?? []),
                        ]),
                      ]);
                    })
                  ),
                ])
              : md.paragraph(),

            // Parameters section
            constructor.paramTags.length !== 0
              ? md.paragraph([
                  md.strong(md.text("Parameters")),
                  md.list(
                    "unordered",
                    constructor.paramTags.map((paramTag) => {
                      return md.listItem([
                        md.paragraph([
                          md.inlineCode(`${paramTag.parameterName}`),
                          md.text("- "),
                          tagsToMdast(args.project, paramTag.inlineTags ?? []),
                        ]),
                      ]);
                    })
                  ),
                ])
              : md.paragraph(),

            // "See also" section
            ...makeSeeAlso(args.project, constructor.seeTags),
          ].flat(1)
        ),
        md.text("\n\n"),
      ].flat(1)
    )
    .flat(1);
};

const makeElementDetailBody: MakeBodyFunction = (args) => {
  const { doc } = args;
  return (doc.elements ?? [])
    .map((elem) =>
      [
        args.project.declareEntity({
          canonicalName: elem.name,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${elem.name}()`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${doc.simpleTypeName}.${elem.name}`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${doc.simpleTypeName}.${elem.name}()`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${elem.qualifiedName}`,
          pageUri: args.pageUri,
        }),
        args.project.declareEntity({
          canonicalName: `${elem.qualifiedName}()`,
          pageUri: args.pageUri,
        }),
        makeDetail(
          [md.text(elem.name)],
          [
            md.inlineCode(
              `${elem.modifiers} ${elem.returnType.typeName} ${elem.name}`
            ),
            md.text("\n\n"),
            tagsToMdast(args.project, elem.inlineTags),
            elem.defaultValue !== null
              ? md.paragraph([
                  md.text("\n\n"),
                  md.strong(md.text("Default:")),
                  md.text("\n"),
                  md.inlineCode(elem.defaultValue ?? ""),
                ])
              : md.text(""),
            ...makeSeeAlso(args.project, elem.seeTags),
          ]
        ),
      ].flat(1)
    )
    .flat(1);
};

function uniqueify(s: string[]): string[] {
  return [
    ...new Set<string>(s.filter((str) => str !== null && str.trim() !== "")),
  ];
}

function getParamNames(parameter: AnyType): string[] {
  const paramNames: string[] = [
    parameter.qualifiedTypeName,
    parameter.simpleTypeName,
    parameter.typeName,
    processParam(parameter),
  ];
  return uniqueify(paramNames);
}

function getMethodNames(method: MethodDoc) {
  return uniqueify([
    method.qualifiedName,
    method.name,
    method.containingClass?.typeName + "." + method.name,
  ]);
}

function getParamNameCombinations(
  paramNames: string[][],
  paramPosition: number,
  current: string[],
  length: number,
  paramCombinations: string[]
) {
  if (paramPosition === length) {
    // we've generated a full list of parameters -- add to our parameter name combinations
    paramCombinations.push(current.join(" "));
    paramCombinations.push(current.join(", ")); // some references separate with commas, some with spaces
  } else {
    paramNames[paramPosition].forEach((pos) => {
      getParamNameCombinations(
        paramNames,
        paramPosition + 1,
        [...current, pos],
        length,
        paramCombinations
      );
    });
  }
}

function makeMethodAnchors(
  project: Project,
  method: MethodDoc,
  pageUri: string
) {
  if (method.parameters.length == 0) {
    return []; // no need to create any anchors -- there's only one possible anchor, and it conflicts with the top-level method reference
  }
  const methodNames = getMethodNames(method);
  const paramNames = method.parameters.map((parameter) =>
    getParamNames(parameter.type)
  );
  const paramCombinations: string[] = [];
  getParamNameCombinations(
    paramNames,
    0,
    [],
    paramNames.length,
    paramCombinations
  );
  const anchors: string[] = [];
  methodNames.forEach((name) =>
    paramCombinations.forEach((paramCombo) =>
      anchors.push(name + "(" + paramCombo + ")")
    )
  );
  // get unique set of anchors, then turn into entities
  return uniqueify([...anchors, getCanonicalNameForMethod(method)]).map(
    (anchor) => project.declareEntity({ canonicalName: anchor, pageUri })
  );
}

const makeMethodOverloadsDetailBody: MakeBodyFunction<MethodDoc[]> = (args) => {
  const { project, pageUri, doc: overloadDocs } = args;
  return overloadDocs
    .map((doc) => {
      return [
        ...makeMethodAnchors(project, doc, pageUri),

        makeDetail(
          [
            makeFunctionDeclaration({
              project,
              doc,
              modifiers: true,
              returnType: true,
            }),
          ],
          [
            tagsToMdast(project, doc.inlineTags),

            md.paragraph(),
            // Type Parameters section
            doc.typeParamTags.length !== 0
              ? md.paragraph([
                  md.strong(md.text("Type Parameters")),
                  md.list(
                    "unordered",
                    doc.typeParamTags.map((tag) => {
                      return md.listItem([
                        md.paragraph([
                          md.inlineCode(`${tag.parameterName}`),
                          md.text("- "),
                          tagsToMdast(project, tag.inlineTags ?? []),
                        ]),
                      ]);
                    })
                  ),
                ])
              : md.paragraph(),

            // Parameters section
            doc.paramTags.length !== 0
              ? md.paragraph([
                  md.strong(md.text("Parameters")),
                  md.list(
                    "unordered",
                    doc.paramTags.map((paramTag) => {
                      return md.listItem([
                        md.paragraph([
                          md.inlineCode(`${paramTag.parameterName}`),
                          md.text("- "),
                          tagsToMdast(project, paramTag.inlineTags ?? []),
                        ]),
                      ]);
                    })
                  ),
                ])
              : md.paragraph(),

            // Returns section
            doc.tags.filter((tag) => /^@returns?$/.test(tag.kind)).length !== 0
              ? md.paragraph([
                  md.paragraph(md.strong(md.text("Returns"))),
                  md.paragraph([
                    tagsToMdast(
                      project,
                      doc.tags.find((tag) => /^@returns?$/.test(tag.kind))
                        ?.inlineTags ?? []
                    ),
                  ]),
                ])
              : md.paragraph(),

            // Throws section
            doc.throwsTags.length !== 0
              ? md.paragraph([
                  md.strong(md.text("Throws")),
                  md.list(
                    "unordered",
                    doc.throwsTags.map((tag) => {
                      return md.listItem([
                        md.paragraph([
                          tag.exceptionType !== undefined
                            ? project.linkToEntity(
                                tag.exceptionType.qualifiedTypeName,
                                `${tag.exceptionName}`
                              )
                            : md.text(""),
                          md.text(" - "),
                          tagsToMdast(project, tag.inlineTags ?? []),
                        ]),
                      ]);
                    })
                  ),
                ])
              : md.paragraph(),

            // Overrides section
            doc.overriddenMethodContainingClass != null
              ? md.paragraph([
                  md.strong(md.text("Overrides")),
                  md.text("\n\n"),
                  md.inlineCode(doc.name),
                  md.text("in class "),
                  project.linkToEntity(
                    doc.overriddenMethodContainingClass.qualifiedTypeName,
                    doc.overriddenMethodContainingClass.simpleTypeName
                  ),
                ])
              : md.text(""),

            // "See also" section
            ...makeSeeAlso(project, doc.seeTags),
          ].flat(1)
        ),
      ];
    })
    .flat(1);
};
