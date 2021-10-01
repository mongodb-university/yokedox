import { brk, link, list } from "mdast-builder";
import { FinalizedProject } from "../../Project.js";
import {
  md,
  toctree,
  toctreeItem,
  ToctreeItemNode,
  TypedNode,
} from "../../yokedast.js";
import { JavadocEntityData } from "./index.js";

export type BuildIndexesArgs = {
  finalizedProject: FinalizedProject<JavadocEntityData>;
};

// transforms a java package path (e.g. "io.realm.annotations")
// into a folder path for docs ("io/realm/annotations")
export function packageToFolderPath(pkg: string): string {
  return pkg.replace(/\./g,'/')
}

export const buildIndexes = async ({
  finalizedProject,
}: BuildIndexesArgs): Promise<void> => {
  const pkgs = finalizedProject.entities
    .filter((e) => e.data?.category === "package");
  const root = md.root([
    toctree(
      pkgs.map((entity) => {
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
    brk,
    list("unordered", pkgs.map((pkg) => {
      return md.listItem(finalizedProject.linkToEntity(pkg.canonicalName))
    }))
  ]);
  finalizedProject.writePage({
    path: "/index",
    root,
  });

  const packages = finalizedProject.entities
    .filter((e) => e.data?.category === "package")

  packages.forEach(pkg => {
    const members = finalizedProject.entities
      .filter((e) => e.data?.category === "class")
      .filter((e) => e.data?.containingPackage === pkg.canonicalName)

    const memberClasses = members
      .filter((e) => e.data?.classType === "class").sort((a, b) => { return a.canonicalName.localeCompare(b.canonicalName) } );
    const memberExceptions = members
      .filter((e) => e.data?.classType === "exception").sort((a, b) => { return a.canonicalName.localeCompare(b.canonicalName) } );
    const memberErrors = members
      .filter((e) => e.data?.classType === "error").sort((a, b) => { return a.canonicalName.localeCompare(b.canonicalName) } );

    const membersSorted = memberClasses.concat(memberExceptions).concat(memberErrors);
    const pkgRoot = md.root([
      toctree(
        membersSorted.map(member => {
          const value = '' + member.data?.simpleTypeName
          return toctreeItem({
            url: packageToFolderPath(member.canonicalName),
            value
          })
        }).filter((e) => e !== undefined) as ToctreeItemNode[]),
      brk,
      list("unordered", membersSorted.map(member => {
        return md.listItem(finalizedProject.linkToEntity(member.canonicalName))
      }))
    ])
    finalizedProject.writePage({
      path: packageToFolderPath(pkg.canonicalName),
      root: pkgRoot
    })
  });
};
