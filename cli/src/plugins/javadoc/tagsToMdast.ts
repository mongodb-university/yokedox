import { strict as assert } from "assert";
import * as md from "mdast-builder";
import { Node, Parent } from "../../mdast.js";
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
  // All nodes should be in a paragraph, so scoop them into paragraphs.
  const paragraphs: Node[] = [];
  let paragraph: Parent | undefined;
  nodes.forEach((node) => {
    if (node.type === "paragraph") {
      // Start scooping subsequent non-paragraph nodes into this paragraph
      paragraph = node as Parent;
      paragraphs.push(paragraph);
      return;
    }
    if (paragraph === undefined) {
      // All non-paragraph nodes will be in a paragraph
      paragraph = md.paragraph();
      paragraphs.push(paragraph);
    }
    paragraph.children.push(node);
  });
  return paragraphs;
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
        return [...mdast.children, md.text(" ")];
      }
      case "@code":
        return [md.inlineCode(tag.text), md.text(" ")];
      default:
        return [md.text(tag.text), md.text(" ")];
    }
  },
  SeeTag(tag) {
    // TODO: Turn this into an actual link
    return [md.strong(md.text(tag.text)), md.text(" ")];
  },
};
