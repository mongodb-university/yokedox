import * as Path from "path";
import { visit } from "unist-util-visit";
import { promises } from "fs";
import { Project } from "./Project";
import { Page } from "./Page";
import { AnchorNode, InternalLinkNode, md } from "./mdast";

/**
  Creates a project object, which is a collection of documentation pages.
 */
export async function makeProject({
  out,
  fs = promises,
}: {
  out?: string;
  fs?: typeof promises;
}): Promise<Project> {
  // Use the current working directy if no output directory was provided
  const outputDirectory = Path.resolve(out ?? "");

  // Throw if path does not exist or is not a directory
  if (!(await fs.lstat(outputDirectory)).isDirectory()) {
    throw new Error(`output path '${outputDirectory}' is not a directory!`);
  }

  const flushPage = async (page: Page): Promise<void> => {
    const json = JSON.stringify(page);
    const outputPath = Path.join(outputDirectory, `${page.path}.json`);
    await fs.mkdir(Path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, json, "utf8");
  };

  const pendingPages: Page[] = [];
  const writePromises: Promise<void>[] = [];
  const validPaths = new Set<string>();
  let isFinalized = false;

  const project: Project = {
    makeAnchor(anchorName) {
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
    makeInternalLink(path, title, kids) {
      return {
        ...md.link(path, title, kids),
        isInternalLink: true,
      };
    },
    writePage(page) {
      // Add page path to project lookup table
      const { path } = page;
      validPaths.add(path);

      // Find all anchors and add them to the project lookup table
      visit(
        page.root,
        // Filter out nodes that don't conform to makeAnchor() return value above
        (node) => node.type === "html" && node.anchorName !== undefined,
        // Visit each anchor node
        (node) => {
          const anchor = node as AnchorNode;
          const newPath = `${path}#${anchor.anchorName}`;
          validPaths.add(newPath);
        }
      );

      // Find all internal link nodes and check for invalid anchors
      const missingLinks: string[] = [];
      visit(
        page.root,
        (node) => node.type === "link" && node.isInternalLink === true,
        (node) => {
          const link = node as InternalLinkNode;
          const { url } = link;
          if (!validPaths.has(url)) {
            missingLinks.push(url);
          }
        }
      );

      // If any links are missing, hold page
      if (missingLinks.length !== 0) {
        pendingPages.push(page);
        return;
      }

      // All links are good, write to disk
      const promise = flushPage(page).catch(console.error);
      writePromises.push(promise);
      return promise;
    },
    async finalize() {
      isFinalized = true;
      // Final link validation
      const runThroughPendingPages = () => {
        const pages = [...pendingPages];
        // Clear pending pages
        pendingPages.length = 0;
        pages.forEach(project.writePage);
      };

      // Run through pending pages once to ensure that all available page paths
      // and anchors are in fact registered.
      runThroughPendingPages();

      // Continue this until there is no decrease in the length of pending
      // pages. At that point, all links that can be resolved have been
      // resolved, and the remaining links cannot be resolved.
      for (
        let pendingBefore = pendingPages.length;
        pendingPages.length !== 0 && pendingPages.length !== pendingBefore;
        pendingBefore = pendingPages.length
      ) {
        runThroughPendingPages();
      }

      // If there are still pending pages (with unresolved links), report error
      // and flush the pages.
      writePromises.push(
        ...pendingPages.map((page) => {
          console.warn(`page ${page.path} has unresolved internal links!`);
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
