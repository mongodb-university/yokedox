import { strict as assert } from "assert";
import * as md from "mdast-builder";
import { Node, Parent } from "../../mdast.js";
import { phrasing as isPhrasing } from "mdast-util-phrasing";
import { Project } from "../../Project.js";
import {
  AnyTag,
  ParamTag,
  SeeTag,
  SerialFieldTag,
  Tag,
  ThrowsTag,
} from "./doclet8.js";
import { parseHtmlToMdast } from "./parseHtmlToMdast.js";

export function tagsToMdast(project: Project, tags: AnyTag[]): Node[] {
  const nodes = tags
    .map((tag) => {
      const visit = visitor[tag._class];
      if (visit === undefined) {
        return [];
      }
      return (visit as (t: AnyTag, i: Project) => Node[])(tag, project);
    })
    .flat(1);

  // All unwrapped 'phrasing' nodes should be in a paragraph, so scoop them into
  // paragraphs. See mdast's content model for details on 'phrasing'.
  const result: Node[] = [];
  let paragraph: Parent | undefined;
  nodes.forEach((node) => {
    if (node.type === "paragraph") {
      // Start scooping subsequent non-phrasing nodes into this paragraph
      paragraph = node as Parent;
      result.push(paragraph);
      return;
    }
    if (!isPhrasing(node)) {
      // Non-phrasing nodes go after the current paragraph.
      paragraph = undefined;
      result.push(node);
      return;
    }
    if (paragraph === undefined) {
      // All phrasing nodes will be in a paragraph
      paragraph = md.paragraph();
      result.push(paragraph);
    } else if (node.type !== "text" || /^[A-z]/.test(node.value)) {
      // Ensure separation between elements in the paragraph.
      paragraph.children.push(md.text(" "));
    }
    paragraph.children.push(node);
  });
  return result;
}

type TagVisitor<In = void, Out = void> = {
  Tag?(tag: Tag, input: In): Out;
  ParamTag?(tag: ParamTag, input: In): Out;
  SeeTag?(tag: SeeTag, input: In): Out;
  SerialFieldTag?(tag: SerialFieldTag, input: In): Out;
  ThrowsTag?(tag: ThrowsTag, input: In): Out;
};

const visitor: TagVisitor<Project, Node | Node[]> = {
  Tag(tag) {
    switch (tag.kind) {
      case "Text": {
        // Text may contain HTML.
        const mdast = parseHtmlToMdast(tag.text);
        // Don't return "root" node
        assert(mdast.type === "root");
        return mdast.children;
      }
      case "@code":
        return md.inlineCode(tag.text);
      default:
        return md.text(tag.text);
    }
  },
  SeeTag(tag) {
    // TODO: Turn this into an actual link
    return md.strong(md.text(tag.text));
  },
};
