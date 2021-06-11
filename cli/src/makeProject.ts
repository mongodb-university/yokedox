import * as Path from "path";
import { promises } from "fs";
import { Project } from "./Project";
import { Page } from "./Page";

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

  const pendingPages: Page[] = [];
  const writePromises: Promise<void>[] = [];

  const project: Project = {
    writePage(page) {
      // TODO: Validate links
      // - Add page uri to project lookup table
      // - Find all anchor links and add them to the project lookup table
      // - Find all internal link nodes
      // - Check link URIs in lookup table
      // - If any links are missing, hold page
      pendingPages.push(page);
      // - Otherwise, if all links are good, write to disk
      const json = JSON.stringify(page);
      writePromises.push(
        fs
          .writeFile(Path.join(outputDirectory, page.uri), json, "utf8")
          .catch(console.error)
      );
    },
    async finalize() {
      // Final link validation
      const runThroughPendingPages = () => {
        const pages = [...pendingPages];
        // Clear pending pages
        pendingPages.length = 0;
        pages.forEach(project.writePage);
      };

      // Run through pending pages once to ensure that all available URIs are in
      // fact registered.
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
      if (pendingPages.length !== 0) {
        // TODO: Report error
      }

      await Promise.allSettled(writePromises);
    },
  };
  return project;
}
