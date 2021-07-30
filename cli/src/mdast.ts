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
export type RootNode = ReturnType<typeof MdastBuilder.root>;

export type CodeNode = ReturnType<typeof MdastBuilder.code>;

/**
  Helper to more accurately define mdast-builder types. See TypedNode.
 */
type MdastBuilderNodes = Omit<typeof MdastBuilder, "brk" | "rootWithTitle"> & {
  break: typeof MdastBuilder.brk;
  // https://github.com/syntax-tree/mdast#heading
  heading: () => Parent & { depth: number };
  // https://github.com/syntax-tree/mdast#list
  list: () => Parent & { start?: number; ordered?: boolean };
};

export type MdastNodeType = keyof MdastBuilderNodes;

/**
  Contains type information for the specific mdast node.
 */
export type TypedNode<Type extends MdastNodeType> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (MdastBuilderNodes[Type] extends (...args: any[]) => infer R
    ? R
    : MdastBuilderNodes[Type]) & { type: Type; value?: string };

/**
  Returns true if the given node is a 'phrasing' node, including extended nodes.
  See https://github.com/syntax-tree/mdast#phrasingcontent for details.
 */
export const isPhrasing = (node: Node): boolean => {
  return phrasing(node) || node.type === "linkToEntity";
};
