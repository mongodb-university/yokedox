import { strict as assert } from "assert";
import unified from "unified";
import * as md from "mdast-builder";
import { Node } from "../../mdast.js";
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
import { scoopPhrasingNodesIntoParagraph } from "./scoopPhrasingNodesIntoParagraph.js";

export function tagsToMdast(project: Project, tags: AnyTag[]): Node {
  const nodes = tags
    .map((tag) => {
      const visit = visitor[tag._class];
      if (visit === undefined) {
        return [];
      }
      return (visit as (t: AnyTag, i: Project) => Node[])(tag, project);
    })
    .flat(1);
  return unified().use(scoopPhrasingNodesIntoParagraph).runSync(md.root(nodes));
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
  SeeTag({ referencedMemberName, referencedClassName, text }, project) {
    let target = `${referencedClassName}.md`; // TODO: Avoid using explicit filenames (.md)
    if (referencedMemberName !== undefined) {
      target = `${target}#${referencedMemberName}`;
    }
    return project.makeInternalLink(target, text, md.text(text));
  },
};
