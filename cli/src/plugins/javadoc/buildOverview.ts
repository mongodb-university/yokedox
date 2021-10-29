import { promises as fs } from "fs";
import { list } from "mdast-builder";
import unified, { Plugin, Transformer } from "unified";
import { Node } from "unist";
import * as unist from "unist-util-visit";
import { parseHtmlToMdast } from "../../parseHtmlToMdast.js";
import { FinalizedProject } from "../../Project.js";
import {
  md,
  toctree,
  toctreeItem,
  ToctreeItemNode,
  TypedNode,
} from "../../yokedast.js";
import { BuildIndexesArgs, packageToFolderPath } from "./buildIndexes.js";
import { JavadocEntityData } from "./index.js";

export type BuildOverviewArgs = BuildIndexesArgs;

/**
  Builds the main index file, including overview content if specified by the
  -overview flag in javadoc.
 */
export const buildOverview = async (args: BuildOverviewArgs): Promise<void> => {
  const { finalizedProject } = args;
  const packages = finalizedProject.entities.filter(
    (e) => e.data?.category === "package"
  );

  const overviewContent = await buildOverviewContent(args);

  // Build index page toctree
  const root = md.root([
    toctree(
      packages
        .map((entity) => {
          const linkToEntity = finalizedProject.linkToEntity(
            entity.canonicalName
          );
          if (linkToEntity.type !== "link") {
            return undefined;
          }
          const link = linkToEntity as TypedNode<"link">;
          return toctreeItem({
            url: packageToFolderPath(link.url.replace(/#.*$/, "")),
            value: entity.canonicalName.replace(/#.*$/, ""),
          });
        })
        .filter((e) => e !== undefined) as ToctreeItemNode[]
    ),
    overviewContent,
    list(
      "unordered",
      packages.map((pkg) => {
        return md.listItem(finalizedProject.linkToEntity(pkg.canonicalName));
      })
    ),
  ]);

  await finalizedProject.writePage({
    path: "/index",
    root,
  });
};

export const buildOverviewContent = async ({
  finalizedProject,
  overviewPath,
}: BuildOverviewArgs): Promise<Node> => {
  if (overviewPath === undefined) {
    return md.brk;
  }

  const overviewHtml = await fs.readFile(overviewPath, "utf8");
  return parseOverviewHtml({ finalizedProject, overviewHtml });
};

export const parseOverviewHtml = ({
  finalizedProject,
  overviewHtml,
}: {
  finalizedProject: FinalizedProject<JavadocEntityData>;
  overviewHtml: string;
}): Node => {
  const mdast = parseHtmlToMdast(overviewHtml);
  return unified().use(parseOverviewTags, finalizedProject).runSync(mdast);
};

/**
  Decodes javadoc tags after parsing the HTML from all tags into mdast.
  Only "\{\@\link}" tags are currently supported.
 */
const parseOverviewTags: Plugin<[FinalizedProject<JavadocEntityData>]> = (
  project: FinalizedProject
): Transformer => {
  return (node: Node): Node => {
    unist.visit(
      node,
      () => true, // visit all tags
      (node, index, parent) => {
        if (index === null || parent === null) {
          return;
        }
        // Supported tags in overview.html: https://docs.oracle.com/javase/7/docs/technotes/tools/windows/javadoc.html#overviewtags
        const textNode = node as TypedNode<"text">;
        if (!/\{@link\s+[^}]+\}/.test(textNode.value ?? "")) {
          return;
        }
        const textValue = textNode.value ?? "";
        const searchTerm = "{@link ";
        const newNodes: Node[] = [];
        for (
          let previousPosition = 0, position = textValue.indexOf(searchTerm);
          position !== -1 && position < textValue.length - searchTerm.length;
          position = textValue.indexOf(searchTerm, position + 1)
        ) {
          const previousText = textValue.substring(previousPosition, position);
          newNodes.push({
            type: "text",
            value: previousText,
          });
          const tagEnd = textValue.indexOf("}", position + 1);
          const entityName = textValue
            .substring(position + searchTerm.length, tagEnd)
            .trim()
            .replace(/#/g, ".");
          newNodes.push(project.linkToEntity(entityName));
          position = tagEnd;
        }
        // Replace the node with the new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
    );
    return node;
  };
};
