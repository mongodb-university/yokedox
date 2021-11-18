import { brk, list } from "mdast-builder";
import { FinalizedProject } from "../../Project.js";
import { md, toctree, toctreeItem, ToctreeItemNode } from "../../yokedast.js";
import { buildOverview } from "./buildOverview.js";
import { JavadocEntityData } from "./index.js";

export type BuildIndexesArgs = {
  finalizedProject: FinalizedProject<JavadocEntityData>;
  overviewPath?: string;
};

// transforms a java package path (e.g. "io.realm.annotations")
// into a folder path for docs ("io/realm/annotations")
export function packageToFolderPath(pkg: string): string {
  return pkg.replace(/\./g, "/");
}

export const buildIndexes = async ({
  finalizedProject,
  overviewPath,
}: BuildIndexesArgs): Promise<void> => {
  await buildOverview({
    finalizedProject,
    overviewPath,
  });

  const packages = finalizedProject.entities.filter(
    (e) => e.data?.category === "package"
  );

  const promises = packages.map(async (pkg) => {
    const members = finalizedProject.entities
      .filter((e) => e.data?.category === "class")
      .filter((e) => e.data?.containingPackage === pkg.canonicalName);

    const memberClasses = members
      .filter((e) => e.data?.classType === "class")
      .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
    const memberExceptions = members
      .filter((e) => e.data?.classType === "exception")
      .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
    const memberErrors = members
      .filter((e) => e.data?.classType === "error")
      .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

    const membersSorted = memberClasses
      .concat(memberExceptions)
      .concat(memberErrors);
    const pkgRoot = md.root([
      toctree(
        membersSorted
          .map((member) => {
            const value = "" + member.data?.simpleTypeName;
            return toctreeItem({
              url: packageToFolderPath(member.canonicalName),
              value,
            });
          })
          .filter((e) => e !== undefined) as ToctreeItemNode[]
      ),
      brk,
      list(
        "unordered",
        membersSorted.map((member) => {
          return md.listItem(
            finalizedProject.linkToEntity(member.canonicalName)
          );
        })
      ),
    ]);
    await finalizedProject.writePage({
      path: packageToFolderPath(pkg.canonicalName),
      root: pkgRoot,
    });
  });
  await Promise.all(promises);
};
