/**
  Convenience export of mdast builder.
 */
export * as md from "mdast-builder";
import { link, root, rootWithTitle } from "mdast-builder";

/**
  Represents a link in mdast.
 */
export type LinkNode = ReturnType<typeof link>;

/**
  Represents a root (page) node in mdast.
 */
export type RootNode =
  | ReturnType<typeof root>
  | ReturnType<typeof rootWithTitle>;
