/**
  Convenience export of mdast builder.
 */
export * as md from "mdast-builder";
export { Node, Parent } from "unist";
import { Parent } from "unist";
import { code, html, root, rootWithTitle } from "mdast-builder";

/**
  Represents a link within the project in mdast.
 */
export type LinkToEntityNode = Parent & {
  type: "linkToEntity" | "link" | "strong";
  targetCanonicalName: string;
  isPending: boolean;
  linkText: string;
};

/**
  Represents an anchor (subsection link target) in mdast.
 */
export type AnchorNode = ReturnType<typeof html> & {
  anchorName: string;
};

/**
  Represents a root (page) node in mdast.
 */
export type RootNode =
  | ReturnType<typeof root>
  | ReturnType<typeof rootWithTitle>;

export type CodeNode = ReturnType<typeof code>;
