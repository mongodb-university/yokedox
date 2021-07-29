import { visit } from "unist-util-visit";
import { MdastNodeType, Parent, RootNode, TypedNode } from "./mdast.js";

export type ToRstOptions = {
  //
};

export const toRst = (root: RootNode, options?: ToRstOptions): string => {
  const result: string[] = [];
  const context: RstContext = {
    indent: 0,
  };
  visit(root, undefined, (node, i, parent) => {
    const handler = handlers[node.type as MdastNodeType];
    if (handler === undefined) {
      // handle undefined
    } else {
      result.push(handler(context, node, i, parent));
    }
  });
  return result.join();
};

type RstContext = {
  indent: number;
};

type Handler<Type extends MdastNodeType> = (
  context: RstContext,
  node: TypedNode<Type>,
  index: number | null,
  parent: Parent | null
) => string;

const handlers: {
  [type in MdastNodeType]: Handler<type>;
} = {
  blockquote(c, n, i, p) {
    // TODO
    return "";
  },
  break(c, n, i, p) {
    // TODO
    return "";
  },
  code(c, n, i, p) {
    // TODO
    return "";
  },
  emphasis(c, n, i, p) {
    // TODO
    return "";
  },
  heading(c, n, i, p) {
    // TODO
    return "";
  },
  html(c, n, i, p) {
    // TODO
    return "";
  },
  image(c, n, i, p) {
    // TODO
    return "";
  },
  inlineCode(c, n, i, p) {
    // TODO
    return "";
  },
  link(c, n, i, p) {
    // TODO
    return "";
  },
  list(c, n, i, p) {
    // TODO
    return "";
  },
  listItem(c, n, i, p) {
    // TODO
    return "";
  },
  paragraph(c, n, i, p) {
    // TODO
    return "";
  },
  root(c, n, i, p) {
    // TODO
    return "";
  },
  strong(c, n, i, p) {
    // TODO
    return "";
  },
  text(c, n, i, p) {
    // TODO
    return "";
  },
};
