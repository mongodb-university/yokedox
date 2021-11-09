import { strict as assert } from "assert";
import { decode, encode } from "html-entities";
import * as md from "mdast-builder";
import unified, { Plugin, Transformer } from "unified";
import * as unist from "unist-util-visit";
import { parseHtmlToMdast } from "../../parseHtmlToMdast.js";
import { Project } from "../../Project.js";
import { Node, TypedNode } from "../../yokedast.js";
import {
  AnyTag,
  ParamTag,
  SeeTag,
  SerialFieldTag,
  Tag,
  ThrowsTag,
} from "./doclet8.js";

export function tagsToMdast(project: Project, tags: AnyTag[]): Node {
  // Javadoc tags can contain html tags spread over several tags. That is, the
  // open and close tags of an HTML element may be in completely different
  // javadoc tags. First encode all tags, combine them into one string, parse
  // out the HTML, then restore the tags.
  const tagsAsHtmlParseableString = tags
    .map((tag) => {
      if (tag.kind === "Text") {
        return tag.text;
      }
      const encodedTag = encode(JSON.stringify(tag));
      return `${preHtmlParseTagDelimiter}${encodedTag}${preHtmlParseTagDelimiter}`;
    })
    .join("");
  const mdast = parseHtmlToMdast(tagsAsHtmlParseableString);
  assert(mdast.type === "root");
  return unified().use(decodeTags, project).runSync(mdast);
}

// Decode javadoc tags after parsing the HTML from all tags into mdast.
const decodeTags: Plugin<[Project]> = (project: Project): Transformer => {
  return (node: Node): Node => {
    unist.visit(
      node,
      () => true, // visit all tags
      (node) => {
        // If the node contains an encoded javadoc tag, decode the tag and
        // modify this node. Otherwise, leave the node alone.
        const textNode = node as TypedNode<"text">;
        if (!textNode.value?.includes(preHtmlParseTagDelimiter)) {
          return; // Do not modify
        }
        const segments = textNode.value?.split(preHtmlParseTagDelimiter) ?? [];
        // Completely replace the node with the new node
        Object.keys(textNode).forEach((key) => delete textNode[key]);
        Object.assign(
          textNode,
          md.paragraph(
            segments
              .map((segment) => {
                const decodedSegment = decode(segment);
                try {
                  const tag = JSON.parse(decodedSegment) as AnyTag;
                  const visit = visitor[tag._class];
                  if (visit === undefined) {
                    return md.text(tag.text);
                  }
                  return (visit as (t: AnyTag, i: Project) => Node[])(
                    tag,
                    project
                  );
                } catch (_) {
                  return decodedSegment === ""
                    ? []
                    : node.type === "code"
                    ? md.code("java", decodedSegment)
                    : md.text(decodedSegment);
                }
              })
              .flat(1)
          )
        );
      }
    );
    return node;
  };
};
type TagVisitor<In = void, Out = void> = {
  Tag?(tag: Tag, input: In): Out;
  ParamTag?(tag: ParamTag, input: In): Out;
  SeeTag?(tag: SeeTag, input: In): Out;
  SerialFieldTag?(tag: SerialFieldTag, input: In): Out;
  ThrowsTag?(tag: ThrowsTag, input: In): Out;
};

const preHtmlParseTagDelimiter = "!!!preHtmlParseTagDelimiter!!!";

const visitor: TagVisitor<Project, Node | Node[]> = {
  Tag(tag) {
    const cleanedText = tag.text.replace("\\@", "@");
    switch (tag.kind) {
      case "Text": {
        return md.text(tag.text);
      }
      case "@code":
        // Javadoc uses some combination of <pre> and {@code} to distinguish
        // between inline code and code blocks. But the HTML elements have
        // already been stripped, so we don't know if this was in a <pre>.
        return /\n/.test(cleanedText)
          ? md.code("java", cleanedText)
          : md.inlineCode(cleanedText);
      default:
        return md.text(cleanedText);
    }
  },
  SeeTag(tag, project) {
    if (tag.text.includes("<a href=")) {
      return parseHtmlToMdast(tag.text);
    }
    return project.linkToEntity(
      [tag.referencedClassName, tag.referencedMemberName]
        .filter((e) => e != null)
        .join("."),
      tag.text
        .replace(/^#/, "") // octothorpe at beginning of ref name: remove
        .replace(/#/g, ".") // octothorpe in the middle of ref name: turn into the dot it ought to be;
    );
  },
};
