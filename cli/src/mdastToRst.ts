import { strict as assert } from "assert";
import { CompilerFunction, Plugin } from "unified";
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import {
  MdastNodeType,
  Node,
  Parent,
  RootNode,
  TypedNode,
  YokedastMdastNodeType,
} from "./yokedast.js";

export type ToRstOptions = {
  //
};

/**
  Unified plugin to convert mdast directly to rST string.
 */
export const mdastRstStringify: Plugin<[ToRstOptions?]> = function (
  this,
  options
) {
  const Compiler: CompilerFunction = (node) => {
    const rootNode = node as Partial<RootNode>;
    if (rootNode.children === undefined) {
      return "";
    }
    return toRst(rootNode as RootNode, options);
  };
  // See https://github.com/rehypejs/rehype/blob/8ddc4b84b1c38bd38bb26d8893af65495f60f2c3/packages/rehype-stringify/lib/index.js#L14
  Object.assign(this, { Compiler });
};

/**
  Converts the given mdast tree to an rST string.
 */
export const toRst = (root: RootNode, options?: ToRstOptions): string => {
  const context = new RstContext(options);
  context.add(`
.. contents:: On this page
   :local:
   :backlinks: none
   :depth: 2
   :class: singlecol

`);

  context.add(root);
  return context.rstString();
};

type Rst = { indent: number; text: string };

/**
  Return the given string modified for escaping.
 */
type Escaper = (text: string, relativeNodeDepth: number) => string;

class RstContext {
  private indentationLevel = 0;
  private nodeDepth = 0;
  private rst: Rst[] = [];
  private escapers: [number /* nodeDepthWhenAdded */, Escaper][] = [];

  constructor(public options?: ToRstOptions) {}

  rstString(): string {
    return this.rst
      .map(({ indent, text }) => {
        const indentString = new Array(indent).fill(" ").join("");
        return text.replace(/\n/g, `\n${indentString}`);
      })
      .join("");
  }

  indent(spaces = 3): void {
    this.indentationLevel += spaces;
  }

  indented(nodesOrText: Node | Node[] | string, spaces?: number): void {
    this.indent(spaces);
    this.add(nodesOrText);
    this.deindent(spaces);
  }

  deindent(spaces = 3): void {
    this.indentationLevel -= spaces;
    assert(this.indentationLevel >= 0, "over-deindented!");
  }

  addNewline(): void {
    this.add("\n");
  }

  addDoubleNewline(): void {
    this.add("\n\n");
  }

  /**
    Add the given string, node, or nodes to the context.
   */
  add(textOrNodeOrNodes: string | Node | Node[], escaper?: Escaper): void {
    // Received string? Add it to the rST.
    if (typeof textOrNodeOrNodes === "string") {
      const text = this.escapers.reduce(
        (text, [nodeDepthWhenAdded, escape]) =>
          escape(text, nodeDepthWhenAdded - this.nodeDepth),
        textOrNodeOrNodes
      );
      this.rst.push({
        indent: this.indentationLevel,
        text,
      });
      return;
    }

    // Received node array? Pass each to this function.
    const nodeOrNodes = textOrNodeOrNodes;
    if (Array.isArray(nodeOrNodes)) {
      nodeOrNodes.forEach((node) => this.add(node, escaper));
      return;
    }

    // Received single node. Pass it to the node type's corresponding visitor.
    const node = nodeOrNodes;
    if (escaper) {
      // Add the given escaper to the front of the escaper list. Escapers should
      // run from newest to oldest (innermost to outermost).
      this.escapers.unshift([this.nodeDepth, escaper]);
    }
    const lastEscaperLength = this.escapers.length;

    // Increment node depth. This is used for relative node depth passed to
    // escapers.
    this.nodeDepth += 1;
    visit(node, undefined, (node, i, parent) => {
      const type = node.type as MdastNodeType;
      // Handler type is defined by node.type value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const visitor = visitors[type] as Visitor<any> | undefined;
      if (visitor === undefined) {
        console.warn(`No handler for node type ${type}`);
        return CONTINUE;
      }
      visitor(this, node, i, parent);
      // Visitors are responsible for visiting node children
      return SKIP;
    });
    this.nodeDepth -= 1;
    assert(this.nodeDepth >= 0, "unexpected nodeDepth < 0!");
    if (escaper) {
      assert(
        lastEscaperLength === this.escapers.length,
        "visitor did not remove added escapers!"
      );
      this.escapers.shift();
    }
  }
}

// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
const titleAdornmentCharacters = ["^", "=", "-", "~", "_", "`"];

type Visitor<Type extends YokedastMdastNodeType> = (
  context: RstContext,
  node: TypedNode<Type>,
  index: number | null,
  parent: Parent | null
) => void;

const visitors: {
  [Type in YokedastMdastNodeType]: Visitor<Type>;
} = {
  blockquote(c, node) {
    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    c.indented("\n");
    c.indented(node.children);
    c.addNewline();
  },
  break(context) {
    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#line-blocks
    context.addNewline();
    context.add("| ");
  },
  code(c, { lang, value }) {
    if (value === undefined) {
      return;
    }

    c.addDoubleNewline();
    c.add(`.. code-block:: ${lang}\n`);
    c.indented(`\n${value.replace(/\\@/g, "@")}`);
    c.addDoubleNewline();
  },
  entityAnchor() {
    // TODO?
  },
  emphasis(c, { children }) {
    c.add("*");
    c.add(children, (text) => text.replace(/\*/g, "\\*"));
    c.add("*");
  },
  example(c, n) {
    c.add(`.. example:: `);
    c.addDoubleNewline();
    c.indented(n.children);
    c.addDoubleNewline();
  },
  heading(c, { children, depth }) {
    let characterCount = 0;
    c.addDoubleNewline();
    c.add(children, (text) => {
      // Spread the text into an array to get actual character count, including
      // wider characters
      characterCount += [...text].length;
      return text;
    });
    c.addNewline();
    assert(1 <= depth && depth <= 6, `invalid heading depth: ${depth}`);
    c.add(
      new Array(Math.max(characterCount, 4))
        .fill(titleAdornmentCharacters[depth - 1])
        .join("")
    );
    c.addDoubleNewline();
  },
  html(c, n) {
    const { value } = n;
    if (value === undefined) {
      return;
    }
    const anchorRe = /^<a\s+name="([^"]+)"\s*>(?:<\/a>)?$/i;
    const match = anchorRe.exec(value);
    if (match === null) {
      return;
    }
    c.add(`.. _${match[1]}:\n\n`);
  },
  image(c, n, i, p) {
    // TODO
  },
  inlineCode(c, { value }) {
    if (value === undefined) {
      return;
    }
    if (value.indexOf("\n") === -1) {
      // Normal case: single inline code
      c.add(`\`\`${value.trim()}\`\` `);
      return;
    }
  },
  link(c, n) {
    const escaper = (text: string) =>
      text
        .replace(/([<`])/g, "\\$1")
        .replace(/^#/, "") // octothorpe at beginning of ref name: remove
        .replace(/#/, "."); // octothorpe in the middle of ref name: turn into the dot it ought to be;
    const { url } = n;
    const isRefLink = !/^https?:\/\//.test(url);
    if (isRefLink) {
      c.add(":ref:");
    }
    c.add("`");
    c.add(n.children, escaper);
    if (isRefLink) {
      const anchorName = url.split("#")[1];
      assert(
        anchorName !== undefined,
        `unexpected refLink without anchorName from url: ${url}`
      );
      c.add(` <${anchorName}>\` `);
    } else {
      c.add(` <${url}>`);
      c.add("`__ ");
    }
  },
  linkToEntity() {
    // TODO
  },
  list(c, n) {
    c.addDoubleNewline();
    const firstItemToken = n.ordered ? `${n.start ?? 1}. ` : "- ";
    const itemToken = n.ordered ? "#. " : "- ";
    // Add each child as a list item
    n.children.forEach((child, i) => {
      const { type } = child;
      if (type !== "listItem") {
        // https://github.com/syntax-tree/mdast#listcontent-gfm
        console.error(
          `unexpected non-ListContent child node in list: ${child.type}`
        );
        return;
      }
      const listItem = child as TypedNode<"listItem">;
      c.add(i === 0 ? firstItemToken : itemToken);
      c.indented(listItem.children);
      c.addNewline();
    });
    c.addDoubleNewline();
  },
  listItem(_, n) {
    console.error(
      "unexpected visitor call to listItem: list items should have been handled by list visitor directly",
      n
    );
  },
  paragraph(c, { children }) {
    c.add(children);
    c.addDoubleNewline();
  },
  root(c, { children }) {
    c.add(children);
    c.addNewline();
  },
  separator(c) {
    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#transitions
    c.add("----");
    c.addDoubleNewline();
  },
  seealso(c, n) {
    c.add(".. seealso::");
    c.addDoubleNewline();
    c.indented(n.children);
    c.addDoubleNewline();
  },
  strike() {
    // TODO
  },
  strong(c, { children }) {
    c.add("**");
    c.add(children, (text) => text.replace(/\*/g, "\\*"));
    c.add("**");
  },
  table(c, n) {
    c.add(".. list-table::");
    c.indented("\n:header-rows: 1\n\n");
    c.indented(n.children);
    c.addNewline();
  },
  tableCell(_, n) {
    console.error(
      "unexpected visitor call to tableCell: table cells should have been handled by table row visitor directly",
      n
    );
  },
  tableRow(c, n) {
    n.children.forEach((child, i) => {
      const { type } = child;
      if (type !== "tableCell") {
        // https://github.com/syntax-tree/mdast#rowcontent
        console.error(
          `unexpected non-RowContent child node in tableRow: ${child.type}`
        );
        return;
      }
      const cell = child as TypedNode<"tableCell">;
      c.add(i === 0 ? "* - " : "  - ");
      c.indented(cell.children, 4);
      c.addNewline();
    });
    c.addNewline();
  },
  text(c, { value }) {
    if (value === undefined) {
      return;
    }
    c.add(value.replace(/`/g, "\\`"));
  },
  toctree(c, n) {
    c.add(`.. toctree::
   :titlesonly:
   :hidden:

`);
    c.indented("\n");
    c.indented(n.children);
    c.addDoubleNewline();
  },
  toctreeItem(c, { value, url }) {
    c.add(`${value} `, (s) => s.replace(/</g, "\\<"));
    c.add("<");
    c.add(url, (s) => s.replace(/>/g, "\\>"));
    c.add(">");
    c.addNewline();
  },
};
