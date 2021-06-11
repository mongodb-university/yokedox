import isValidPath from "is-valid-path";
import { RootNode } from "./mdast";

/**
  Represents a specific page on a docs site.
 */
export class Page {
  path: string;
  root: RootNode;
  constructor(path: string, root: RootNode) {
    if (!/^\//.test(path)) {
      throw new Error(`expected Page path '${path}' to begin with slash (/)`);
    }
    if (!isValidPath(path)) {
      throw new Error(`invalid Page path: ${path}`);
    }
    this.path = path;
    this.root = root;
  }
}
