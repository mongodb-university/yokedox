/**
  "Yokedast" is a superset of mdast that adds:

  - entity declarations
  - index/table of contents pages
 */
export * as md from "mdast-builder";
export { Node, Parent } from "unist";
import MdastBuilder from "mdast-builder";
import { phrasing } from "mdast-util-phrasing";
import { Node, Parent } from "unist";
import { Entity } from "./Entity.js";

/**
  Represents a link within the project in yokedast.
 */
export type LinkToEntityNode = Parent & {
  type: "linkToEntity" | "link" | "strong";
  targetCanonicalName: string;
  isPending: boolean;
  linkText: string;
  url?: string;
  title?: string;
};

/**
  Represents an anchor (subsection link target) associated with a specific
  entity in yokedast. Each entity should have exactly one anchor.
 */
export type EntityAnchorNode<UserDataType = unknown> = ReturnType<
  typeof MdastBuilder.html
> & {
  anchorName: string;
  entity: Entity<UserDataType>;
};

export type ToctreeNode = Parent & {
  type: "toctree";
};

export type ToctreeItemNode = {
  value: string;
  url: string;
  type: "toctreeItem";
};

export const toctree = (children: ToctreeItemNode[]): ToctreeNode => {
  return {
    children,
    type: "toctree",
  };
};

export const toctreeItem = ({
  value,
  url,
}: Omit<ToctreeItemNode, "type">): ToctreeItemNode => {
  return {
    value,
    url,
    type: "toctreeItem",
  };
};

export type RootNode = ReturnType<typeof MdastBuilder.root>;

export type CodeNode = ReturnType<typeof MdastBuilder.code>;

/**
  Helper to more accurately define mdast-builder types. See TypedNode.
 */
type MdastNodes = Omit<typeof MdastBuilder, "brk" | "rootWithTitle"> & {
  break: typeof MdastBuilder.brk;
  // https://github.com/syntax-tree/mdast#heading
  heading: () => Parent & { depth: number };
  // https://github.com/syntax-tree/mdast#list
  list: () => Parent & { start?: number; ordered?: boolean };
};

/**
  Additional nodes on top of mdast for Yokedox.
 */
type YokedastNodes = {
  entityAnchor: <UserDataType>() => EntityAnchorNode<UserDataType>;
  linkToEntity: () => LinkToEntityNode;
  toctree: typeof toctree;
  toctreeItem: typeof toctreeItem;
};

export type MdastNodeType = keyof MdastNodes;

export type YokedastNodeType = keyof YokedastNodes;

export type YokedastMdastNodeType = YokedastNodeType | MdastNodeType;

type YokedastMdastNodes = YokedastNodes & MdastNodes;

/**
  Contains type information for the specific mdast node.
 */
export type TypedNode<Type extends YokedastMdastNodeType> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (YokedastMdastNodes[Type] extends (...args: any[]) => infer R
    ? R
    : YokedastMdastNodes[Type]) & { type: Type; value?: string };

/**
  Returns true if the given node is a 'phrasing' node, including extended nodes.
  See https://github.com/syntax-tree/mdast#phrasingcontent for details.
 */
export const isPhrasing = (node: Node): boolean => {
  return phrasing(node) || node.type === "linkToEntity";
};
