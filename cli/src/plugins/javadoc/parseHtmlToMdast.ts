import { all } from "hast-util-to-mdast";
import rehypeParse from "rehype-parse";
import rehypeToRemark from "rehype-remark";
import unified from "unified";
import * as unist from "unist-util-visit";
import { CodeNode, Node, Parent } from "../../mdast.js";

const parseHtml = unified().use(rehypeParse, { fragment: true }).parse;
const hastToMdast = unified()
  .use(rehypeToRemark, {
    handlers: {
      // Override root handler, which by default wraps all text nodes in mdast
      // paragraph nodes, which breaks runs of sequential text tags that belong
      // in the same paragraph.
      root(
        h: (node: Node, type: string, children: Node[]) => Node,
        node: Node
      ) {
        const children = all(h, node);
        return h(node, "root", children);
      },
    },
  })
  .use(() => (node) => {
    // Assume all code blocks are java for syntax highlighting
    unist.visit(
      node,
      (node) => node.type === "code",
      (node) => {
        (node as CodeNode).lang = "java";
      }
    );
  }).runSync;

export const parseHtmlToMdast = (html: string): Parent =>
  hastToMdast(parseHtml(html)) as Parent;
