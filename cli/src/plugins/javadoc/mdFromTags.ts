import unified from "unified";
import parseHtml from "rehype-parse";
import rehypeToRemark from "rehype-remark";
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

type TagVisitor<In = void, Out = void> = {
  Tag?(tag: Tag, input: In): Out;
  ParamTag?(tag: ParamTag, input: In): Out;
  SeeTag?(tag: SeeTag, input: In): Out;
  SerialFieldTag?(tag: SerialFieldTag, input: In): Out;
  ThrowsTag?(tag: ThrowsTag, input: In): Out;
};

const htmlParser = unified().use(parseHtml);
const hastToMdast = unified().use(rehypeToRemark);
const htmlToMdast = (html: string) =>
  hastToMdast.runSync(htmlParser.parse(html));

const visitor: TagVisitor<Project, Node[]> = {
  Tag(tag: Tag): Node[] {
    if (tag.kind !== "Text") {
      // TODO
      return [];
    }
    // Javadoc text may contain HTML.
    return [htmlToMdast(tag.text)];
  },
  SeeTag(tag: SeeTag): Node[] {
    // TODO: Turn this into an actual link
    return [md.emphasis(md.text(tag.text))];
  },
};

export function mdFromTags(project: Project, tags: AnyTag[]): Node[] {
  return tags
    .map((tag) => {
      const visit = visitor[tag._class];
      if (visit === undefined) {
        return [];
      }
      return (visit as (t: AnyTag, i: Project) => Node[])(tag, project);
    })
    .flat(1);
}
