import { FinalizedProject } from "../../Project.js";

export type BuildIndexesArgs = {
  finalizedProject: FinalizedProject;
};

export const buildIndexes = async ({
  finalizedProject,
}: BuildIndexesArgs): Promise<void> => {
  // TODO
};
