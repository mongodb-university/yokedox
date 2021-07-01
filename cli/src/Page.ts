import isValidPath from "is-valid-path";
import { RootNode } from "./mdast.js";

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
    // Replace invalid symbols
    path = path.replace(/[<>]/g, "_");
    if (!isValidPath(path)) {
      throw new Error(`invalid Page path: ${path}`);
    }
    this.path = path;
    this.root = root;
  }
}
