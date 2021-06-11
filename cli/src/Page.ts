import { URL } from "url";
import { RootNode } from "./mdast";

/**
  Represents a specific page on a docs site.
 */
export type Page = {
  uri: URL;
  root: RootNode;
};
