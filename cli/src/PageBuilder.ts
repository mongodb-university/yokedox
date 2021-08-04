import { Entity } from "./Entity.js";
import { Page } from "./Page.js";
import { FinalizedProject } from "./Project.js";

export type PageBuilderArgs = {
  project: FinalizedProject;
  entities: Entity[];
  pages: Page[];
};

export type PageBuilder = (args: PageBuilderArgs) => Page[];
