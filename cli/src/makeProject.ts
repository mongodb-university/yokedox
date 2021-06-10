import * as Path from "path";
import { promises } from "fs";
import { Entity } from "./Entity";
import { md } from "./mdast";
import { Project } from "./Project";

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

  const writePromises: Promise<void>[] = [];
  const entitiesById = new Map<string, Entity>();
  const getUriForEntity = (entityId: string): string => {
    const entity = entitiesById.get(entityId);
    if (entity === undefined) {
      throw new Error(`unknown entity id '${entityId}'`);
    }
    // TODO: every entity will eventually exist at a specific location. Whether
    // that location is determined by the plugin is TBD.
    return "this part needs work";
  };
  return {
    addEntity(entity) {
      entitiesById.set(entity.id, entity);
    },
    getEntity(id) {
      return entitiesById.get(id);
    },
    makeLink({ fromUri, toEntityId, title }) {
      try {
        const toUri = getUriForEntity(toEntityId);
        return md.link(toUri, title);
      } catch (error) {
        console.warn(
          new Error(
            `cannot make link to entity id '${toEntityId}' from uri '${fromUri}': ${error.message}`
          )
        );
        // TODO
        return md.link("FIXME", title);
      }
    },
    writePage(page) {
      const json = JSON.stringify(page);
      writePromises.push(
        fs
          .writeFile(Path.join(outputDirectory, page.uri), json, "utf8")
          .catch(console.error)
      );
    },
    async finalize() {
      await Promise.allSettled(writePromises);
    },
  };
}
