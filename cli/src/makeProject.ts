import { strict as assert } from "assert";
import { promises } from "fs";
import { gfmTableToMarkdown } from "mdast-util-gfm-table";
import { toMarkdown } from "mdast-util-to-markdown";
import * as Path from "path";
import { visit } from "unist-util-visit";
import { LinkToEntityNode, md } from "./mdast.js";
import { Page } from "./Page.js";
import { Entity, Project } from "./Project.js";

/**
  Creates a project object, which is a collection of documentation pages.
 */
export async function makeProject({
  out,
  fs = promises,
  outputMdastJson = true,
  outputMarkdown = true,
}: {
  out?: string;
  fs?: typeof promises;
  outputMdastJson?: boolean;
  outputMarkdown?: boolean;
}): Promise<Project> {
  // Use the current working directy if no output directory was provided
  const outputDirectory = Path.resolve(out ?? "");

  // Throw if path does not exist or is not a directory
  if (!(await fs.lstat(outputDirectory)).isDirectory()) {
    throw new Error(`output path '${outputDirectory}' is not a directory!`);
  }

  const flushPage = async (page: Page): Promise<void> => {
    const files: { outputPath: string; data: string }[] = [];
    assert(
      outputMarkdown || outputMdastJson,
      "expected at least one option: outputMarkdown, outputMdastJson"
    );
    if (outputMdastJson) {
      const data = JSON.stringify(page);
      const outputPath = Path.join(outputDirectory, `${page.path}.json`);
      files.push({ outputPath, data });
    }
    if (outputMarkdown) {
      const data = toMarkdown(page.root, {
        extensions: [gfmTableToMarkdown()],
      });
      const outputPath = Path.join(outputDirectory, `${page.path}.md`);
      files.push({ outputPath, data });
    }
    await Promise.all(
      files.map(async (file) => {
        const { outputPath } = file;
        await fs.mkdir(Path.dirname(outputPath), { recursive: true });
        fs.writeFile(outputPath, file.data, "utf8");
      })
    );
  };

  const writePromises: Promise<void>[] = [];
  const entities = new Map<string /* canonical name */, Entity>();

  // A waiting list of sorts
  const pendingPagesByEntity = new Map<string /* canonical name */, Page[]>();

  const onEntityDeclared = (project: Project, entity: Entity) => {
    const { canonicalName } = entity;
    const pagesPendingOnEntity = pendingPagesByEntity.get(canonicalName) ?? [];
    pendingPagesByEntity.delete(canonicalName);
    // writePage() will resolve links
    pagesPendingOnEntity.forEach((page) => {
      project.writePage(page);
    });
  };

  let isFinalized = false;

  const project: Project = {
    declareEntity(entity) {
      const { canonicalName } = entity;
      if (entities.has(canonicalName)) {
        // Users should fix this, but it's not a fatal error.
        console.warn(
          new Error(
            `duplicate entity: ${entity.canonicalName} (${entity.pageUri})`
          )
        );
      } else {
        entities.set(canonicalName, entity);
        // We can now resolve any pages that were waiting for this entity
        onEntityDeclared(this, entity);
      }
      const { anchorName } = entity;
      if (anchorName.length === 0 || /["\s]/.test(anchorName)) {
        throw new Error(
          `anchorName '${anchorName}' must contain at least one character and must not include doublequotes or whitespace`
        );
      }
      // See https://stackoverflow.com/questions/5319754/cross-reference-named-anchor-in-markdown/7335259#7335259
      return {
        ...md.html(`<a name="${anchorName}" ></a>`),
        anchorName,
      };
    },

    linkToEntity(
      targetCanonicalName,
      linkText = targetCanonicalName
    ): LinkToEntityNode {
      const entity = entities.get(targetCanonicalName);
      if (entity === undefined) {
        return {
          ...md.strong([md.text(linkText), md.text(" (?)")]),
          type: "linkToEntity",
          targetCanonicalName,
          isPending: true,
          linkText,
        };
      }
      return resolvedLinkToEntity(entity, linkText);
    },

    writePage(page) {
      // Before writing, make sure links are resolved
      const pendingLinks = findPendingLinks(page);

      const resolvedLinks = resolveLinks(pendingLinks, entities);
      // If any links are still missing, hold page
      assert(resolvedLinks.length <= pendingLinks.length);
      if (pendingLinks.length - resolvedLinks.length !== 0) {
        new Set(
          pendingLinks.map(({ targetCanonicalName }) => targetCanonicalName)
        ).forEach((targetCanonicalName) => {
          const pendingPages =
            pendingPagesByEntity.get(targetCanonicalName) ?? [];
          if (
            pendingPages.find((pendingPage) => page.path === pendingPage.path)
          ) {
            // Page is already on the waiting list
            return;
          }
          pendingPagesByEntity.set(targetCanonicalName, [
            ...pendingPages,
            page,
          ]);
        });
        return;
      }

      // All links are good, write to disk
      const promise = flushPage(page).catch(console.error);
      writePromises.push(promise);
      return promise;
    },

    async finalize() {
      isFinalized = true;

      // Convert pendingPagesByEntity lookup table into an array of unique pages.
      const pendingPages = Array.from(
        new Map(
          Array.from(pendingPagesByEntity.values())
            .flat(1)
            .map((page) => [page.path, page]) // Map entries are [key, value] tuples
        )
      ).map((entry) => entry[1]); // Extract only the page

      // If there are still pending pages (with unresolved links), report error
      // and flush the pages.
      writePromises.push(
        ...pendingPages.map((page) => {
          const pendingLinks = findPendingLinks(page);
          console.warn(
            `page ${page.path} has unresolved internal links:\n${pendingLinks
              .map((link) => `  ${link.targetCanonicalName}`)
              .join("\n")}`
          );

          // Fossilize any broken links as true mdast nodes.
          pendingLinks.forEach((link) =>
            Object.assign(link, {
              type: "strong",
            })
          );

          return flushPage(page);
        })
      );

      await Promise.allSettled(writePromises);
    },
  };
  return {
    ...project,
    writePage(page) {
      // Public guard against writing pages after finalize()
      if (isFinalized) {
        throw new Error(
          `attempted to write page '${page.path}' after finalize()`
        );
      }
      // Dispatch to "internal" implementation
      return project.writePage(page);
    },
  };
}

function resolvedLinkToEntity(
  entity: Entity,
  linkText: string
): LinkToEntityNode {
  const { pageUri, anchorName } = entity;
  const path = [pageUri, anchorName].filter((s) => s !== "").join("#");
  return {
    ...md.link(path, linkText, md.text(linkText)),
    type: "link",
    linkText,
    targetCanonicalName: entity.canonicalName,
    isPending: false,
  };
}

function findPendingLinks(page: Page): LinkToEntityNode[] {
  const pendingLinks: LinkToEntityNode[] = [];
  visit(
    page.root,
    (node) => node.type === "linkToEntity",
    (node) => {
      const link = node as LinkToEntityNode;
      if (link.isPending) {
        pendingLinks.push(link);
      }
    }
  );
  return pendingLinks;
}

/**
  Resolve any pending links.

  @return The resolved links.
 */
function resolveLinks(
  links: LinkToEntityNode[],
  entities: Map<string, Entity>
): LinkToEntityNode[] {
  return links
    .map((link) => {
      // Still pending?
      const entity = entities.get(link.targetCanonicalName);
      if (entity !== undefined) {
        Object.assign(link, { ...resolvedLinkToEntity(entity, link.linkText) });
      }
      return link;
    })
    .filter((link) => link.isPending === false);
}
