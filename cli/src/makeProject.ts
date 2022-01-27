import { strict as assert } from "assert";
import { promises } from "fs";
import * as Path from "path";
import { Parent } from "unist";
import { visit } from "unist-util-visit";
import {
  addExternalEntityPattern,
  ExternalEntityPattern,
} from "./addExternalEntityTransformer.js";
import { Entity, EntityTransformer, InternalEntity } from "./Entity.js";
import { Page } from "./Page.js";
import {
  flushPage as _flushPage,
  markdownPageStringifier,
  mdastJsonPageStringifier,
  PageStringifier,
  rstPageStringifier,
} from "./PageFlusher.js";
import { Project } from "./Project.js";
import { LinkToEntityNode, md } from "./yokedast.js";

export type MakeProjectArgs = {
  /**
    Output path.
   */
  out?: string;

  /**
    The file system library. Can be swapped for unit testing.
   */
  fs?: typeof promises;

  /**
    Whether to output mdast json files.
   */
  outputMdastJson?: boolean;

  /**
    Whether to output markdown files.
   */
  outputMarkdown?: boolean;

  /**
    Whether to output rST files.
   */
  outputRst?: boolean;

  /**
    Whether to output information about duplicate entities generated internally.
   */
  enableDuplicateEntityWarning?: boolean;

  /**
    A way to connect entity canonical names that match a certain pattern with
    some external docs site.
   */
  externalEntityPatterns?: ExternalEntityPattern[];
};

/**
  Creates a project object, which is a collection of documentation pages.

  In practice you can omit the user data type argument. Plugins can freely cast
  to `Project<their specific data type>`. The type argument is provided here for
  unit testing.
 */
export async function makeProject<UserDataType = unknown>({
  out,
  fs = promises,
  outputMdastJson = true,
  outputMarkdown = false,
  outputRst = true,
  enableDuplicateEntityWarning,
  externalEntityPatterns = [],
}: MakeProjectArgs): Promise<Project<UserDataType>> {
  // Use the current working directy if no output directory was provided
  const outputDirectoryPath = Path.resolve(out ?? "");

  // Throw if path does not exist or is not a directory
  if (!(await fs.lstat(outputDirectoryPath)).isDirectory()) {
    throw new Error(`output path '${outputDirectoryPath}' is not a directory!`);
  }

  const stringifiers: PageStringifier[] = [];
  outputMdastJson && stringifiers.push(mdastJsonPageStringifier);
  outputMarkdown && stringifiers.push(markdownPageStringifier);
  outputRst && stringifiers.push(rstPageStringifier);
  assert(
    stringifiers.length > 0,
    "expected at least one: outputMdastJson, outputMarkdown, outputRst"
  );

  const flushPage = (page: Page) => {
    return _flushPage({
      fs,
      page,
      outputDirectoryPath,
      stringifiers,
    });
  };

  const writePromises: Promise<void>[] = [];
  const entities = new Map<string /* canonical name */, Entity>();

  // A waiting list of sorts
  const pendingPagesByEntity = new Map<string /* canonical name */, Page[]>();

  const onEntityDeclared = (
    project: Project<UserDataType>,
    entity: Entity<UserDataType>
  ) => {
    const { canonicalName } = entity;
    const pagesPendingOnEntity = pendingPagesByEntity.get(canonicalName) ?? [];
    pendingPagesByEntity.delete(canonicalName);
    // writePage() will resolve links
    pagesPendingOnEntity.forEach((page) => {
      project.writePage(page);
    });
  };

  let isFinalized = false;

  const EntityTransformers: EntityTransformer[] = [];

  const project: Project<UserDataType> = {
    addEntityTransformer(transformer) {
      EntityTransformers.push(transformer);
    },

    declareEntity(internalEntity: InternalEntity<UserDataType>) {
      const entity: Entity<UserDataType> = {
        ...internalEntity,
        type: "internal",
      };
      const { canonicalName, pageUri } = entity;
      const anchorName = anchorify(entity);
      if (entities.has(canonicalName)) {
        if (enableDuplicateEntityWarning) {
          // Users should fix this, but it's not a fatal error.
          console.warn(
            new Error(`duplicate entity: ${canonicalName} (${pageUri})`)
          );
        }
      } else {
        entities.set(canonicalName, entity);
        // We can now resolve any pages that were waiting for this entity
        onEntityDeclared(this, entity);
      }
      // See https://stackoverflow.com/questions/5319754/cross-reference-named-anchor-in-markdown/7335259#7335259
      return {
        ...md.html(`<a name="${anchorName}" ></a>`),
        anchorName,
        entity,
      };
    },

    linkToEntity(
      targetCanonicalName,
      linkText = targetCanonicalName
    ): LinkToEntityNode {
      const entity = entities.get(targetCanonicalName);
      if (entity === undefined) {
        // External entity links are resolved after project finalization. For
        // now, return a pending link.
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
      const resolvedLinks = resolveLinks({
        EntityTransformers,
        links: pendingLinks,
        entities,
      });
      // If any links are still missing, hold page
      assert(resolvedLinks.length <= pendingLinks.length);

      if (pendingLinks.length - resolvedLinks.length !== 0) {
        // Before finalization, pages can be held in memory while waiting for
        // entities to be declared (which then resolves pending links to those
        // entities)
        if (!isFinalized) {
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

        // After finalization, new entities can't be added, so this link will
        // never be resolved. Write it as a broken link.
        console.warn(
          `page ${page.path} has unresolved internal links:\n${pendingLinks
            .map((link) => `  ${link.targetCanonicalName}`)
            .join("\n")}`
        );

        // Fossilize any broken links as true mdast nodes. This updates the
        // nodes in-place.
        pendingLinks.forEach((pendingLink) => {
          Object.assign(pendingLink, { type: "strong" });
        });
      }

      // All links are dealt with, write to disk
      const promise = flushPage(page).catch(console.error);
      writePromises.push(promise);
      return promise;
    },

    async finalize() {
      isFinalized = true;

      // Convert pendingPagesByEntity lookup table into an array of unique pages.
      Array.from(
        new Map(
          Array.from(pendingPagesByEntity.values())
            .flat(1)
            .map((page) => [page.path, page]) // Map entries are [key, value] tuples
        )
      )
        .map((entry) => entry[1]) // Extract only the page
        .forEach((page) => {
          // Write it to disk
          this.writePage(page);
        });

      await Promise.allSettled(writePromises);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { finalize, declareEntity, ...finalizedProject } = project;

      return {
        ...finalizedProject,
        get entities() {
          return Array.from(entities.values()) as Entity<UserDataType>[];
        },
      };
    },
  };

  externalEntityPatterns.forEach((pattern) => {
    addExternalEntityPattern(project, pattern);
  });

  return project;
}

function resolvedLinkToEntity(
  entity: Entity,
  linkText: string
): LinkToEntityNode {
  const { pageUri } = entity;
  const entityType = entity.type;
  const path =
    entityType === "internal"
      ? [pageUri, anchorify(entity)].filter((s) => s !== "").join("#")
      : pageUri;
  const node: Parent & { type: "strong" | "link" } =
    entityType === "builtIn"
      ? { ...md.strong(md.text(linkText)), type: "strong" }
      : { ...md.link(path, linkText, md.text(linkText)), type: "link" };
  return {
    ...node,
    linkText,
    targetCanonicalName: entity.canonicalName,
    entityType,
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
function resolveLinks({
  EntityTransformers,
  links,
  entities,
}: {
  links: LinkToEntityNode[];
  entities: Map<string, Entity>;
  EntityTransformers: EntityTransformer[];
}): LinkToEntityNode[] {
  return links
    .map((link) => {
      // Still pending?
      let entity = entities.get(link.targetCanonicalName);
      if (entity === undefined) {
        // No local entity found, try external entity.
        for (const transformer of EntityTransformers) {
          entity = transformer(link.targetCanonicalName);
          if (entity !== undefined) {
            break;
          }
        }
      }
      if (entity !== undefined) {
        Object.assign(link, { ...resolvedLinkToEntity(entity, link.linkText) });
      }
      return link;
    })
    .filter((link) => link.isPending === false);
}

/**
  Create an anchor-friendly string from a given string.
 */
const anchorify = ({ canonicalName }: { canonicalName: string }): string => {
  return canonicalName.replace(/[^A-z0-9_]/g, "_");
};
