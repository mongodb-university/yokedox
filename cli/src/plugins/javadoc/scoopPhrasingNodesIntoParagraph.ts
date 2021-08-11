import * as md from "mdast-builder";
import { Plugin, Transformer } from "unified";
import { isPhrasing, Node, Parent } from "../../yokedast.js";

/**
  All unwrapped 'phrasing' nodes should be in a paragraph, so scoop them into
  paragraphs. See mdast's content model for details on 'phrasing'.
 */
export const scoopPhrasingNodesIntoParagraph: Plugin = (): Transformer => {
  return (node: Node): Node => {
    if (node.children === undefined) {
      return node;
    }
    const root = node as Parent;
    const children: Node[] = [];
    let paragraph: Parent | undefined;
    root.children.forEach((node) => {
      if (node.type === "paragraph") {
        // Start scooping subsequent phrasing nodes into this paragraph
        paragraph = node as Parent;
        children.push(paragraph);
        return;
      }
      if (!isPhrasing(node)) {
        // Non-phrasing nodes go after the current paragraph.
        paragraph = undefined;
        children.push(node);
        return;
      }
      if (paragraph === undefined) {
        // All phrasing nodes will be in a paragraph
        paragraph = md.paragraph();
        children.push(paragraph);
      } else {
        // Ensure separation between elements in the paragraph. TODO: Allow some
        // punctuation to "hug" the previous element without the space.
        paragraph.children.push(md.text(" "));
      }
      paragraph.children.push(node);
    });
    return {
      ...root,
      children,
    };
  };
};
