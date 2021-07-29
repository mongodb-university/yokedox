/**
  Convenience export of mdast builder.
 */
export * as md from "mdast-builder";
export { Node, Parent } from "unist";
import MdastBuilder from "mdast-builder";
import { phrasing } from "mdast-util-phrasing";
import { Node, Parent } from "unist";

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
export type AnchorNode = ReturnType<typeof MdastBuilder.html> & {
  anchorName: string;
};

/**
  Represents a root (page) node in mdast.
 */
export type RootNode =
  | ReturnType<typeof MdastBuilder.root>
  | ReturnType<typeof MdastBuilder.rootWithTitle>;

export type CodeNode = ReturnType<typeof MdastBuilder.code>;

export type MdastNodeType =
  | Exclude<keyof typeof MdastBuilder, "brk" | "rootWithTitle">
  | "break";

export type TypedNode<Type extends MdastNodeType> = (Type extends "heading"
  ? Parent & { depth: number }
  : Type extends keyof typeof MdastBuilder
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof MdastBuilder[Type] extends (...args: any[]) => infer R
    ? R
    : typeof MdastBuilder[Type]
  : Node) & { type: Type; value?: string };

/**
  Returns true if the given node is a 'phrasing' node, including extended nodes.
  See https://github.com/syntax-tree/mdast#phrasingcontent for details.
 */
export const isPhrasing = (node: Node): boolean => {
  return phrasing(node) || node.type === "linkToEntity";
};
