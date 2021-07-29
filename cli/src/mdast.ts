/**
  Convenience export of mdast builder.
 */
export * as md from "mdast-builder";
export { Node, Parent } from "unist";
import {
  blockquote,
  brk,
  code,
  emphasis,
  heading,
  html,
  image,
  inlineCode,
  link,
  list,
  listItem,
  paragraph,
  root,
  rootWithTitle,
  strong,
  text,
} from "mdast-builder";
import { Parent } from "unist";

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

const MdastBuilder = {
  blockquote,
  break: brk,
  code,
  emphasis,
  heading,
  html,
  image,
  inlineCode,
  link,
  list,
  listItem,
  paragraph,
  root,
  strong,
  text,
};

export type MdastNodeType = keyof typeof MdastBuilder;

export type TypedNode<Type extends MdastNodeType> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof MdastBuilder[Type] extends (...args: any[]) => any
    ? ReturnType<typeof MdastBuilder[Type]> & { type: Type }
    : never;
