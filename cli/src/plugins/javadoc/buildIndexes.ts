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
        .filter((e) => e.data?.category === "class")
        .map((entity) => {
          const linkToEntity = finalizedProject.linkToEntity(
            entity.canonicalName
          );
          if (linkToEntity.type !== "link") {
            return undefined;
          }
          const link = linkToEntity as TypedNode<"link">;
          return toctreeItem({
            url: link.url.replace(/#.*$/, ""),
            value: entity.canonicalName,
          });
        })
        .filter((e) => e !== undefined) as ToctreeItemNode[]
    ),
  ]);
  finalizedProject.writePage({
    path: "/index",
    root,
  });
};
