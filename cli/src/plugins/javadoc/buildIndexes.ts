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

export const buildIndexes = async ({
  finalizedProject,
}: BuildIndexesArgs): Promise<void> => {
  const root = md.root([
    toctree(
      finalizedProject.entities
        .filter((e) => e.data?.category === "package")
        .map((entity) => {
          const linkToEntity = finalizedProject.linkToEntity(
            entity.canonicalName
          );
          if (linkToEntity.type !== "link") {
            return undefined;
          }
          const link = linkToEntity as TypedNode<"link">;
          return toctreeItem({
            url: link.url.replace(/#.*$/, "").replace(/\./g,'/'),
            value: entity.canonicalName.replace(/#.*$/, "").replace('/', ''),
          });
        })
        .filter((e) => e !== undefined) as ToctreeItemNode[]
    ),
  ]);
  finalizedProject.writePage({
    path: "/index",
    root,
  });

  const packages = finalizedProject.entities
    .filter((e) => e.data?.category === "package")

  packages.forEach(pkg => {
    const pkgRoot = md.root([
      toctree(finalizedProject.entities.filter((e) => e.data?.category === "class").filter((e) => e.data?.containingPackage === pkg.canonicalName)
        .map(child => {
          const sanitizedName = child.canonicalName.replace(/#.*$/, "");
          const value = sanitizedName.substring(sanitizedName.lastIndexOf('.') + 1) // only want simple class name
          return toctreeItem({
            url: child.canonicalName.replace(/\./g,'/'),
            value
          })
        }).filter((e) => e !== undefined) as ToctreeItemNode[])
    ])
    finalizedProject.writePage({
      path: pkg.canonicalName.replace(/\./g,'/'),
      root: pkgRoot
    })
  });
};
