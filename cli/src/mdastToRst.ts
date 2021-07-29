import { strict as assert } from "assert";
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import { MdastNodeType, Node, Parent, RootNode, TypedNode } from "./mdast.js";

export type ToRstOptions = {
  //
};

/**
  Converts the given mdast tree to an rST string.
 */
export const toRst = (root: RootNode, options?: ToRstOptions): string => {
  const context = new RstContext(options);
  context.add(root);
  return context.rstString();
};

type Rst = { indent: number; lines: string[] };

/**
  Return the given string modified for escaping.
 */
type Escaper = (text: string) => string;

class RstContext {
  private indentationLevel = 0;
  private rst: Rst[] = [];
  private escapers: Escaper[] = [];

  constructor(public options?: ToRstOptions) {}

  rstString(): string {
    return this.rst
      .map(({ indent, lines }) => {
        const indentString = new Array(indent).fill(" ").join("");
        return lines.join("").replace(/\n/g, `\n${indentString}`);
      })
      .join("");
  }

  indent(): void {
    this.indentationLevel += 3;
  }

  indented(nodesOrText: Node | Node[] | string): void {
    this.indent();
    this.add(nodesOrText);
    this.deindent();
  }

  deindent(): void {
    this.indentationLevel -= 3;
    assert(this.indentationLevel >= 0, "over-deindented!");
  }

  addNewline(): void {
    this.add("\n");
  }

  addDoubleNewline(): void {
    this.add("\n\n");
  }

  add(textOrNodeOrNodes: string | Node | Node[], escaper?: Escaper): void {
    if (typeof textOrNodeOrNodes === "string") {
      this.rst.push({
        indent: this.indentationLevel,
        lines: [textOrNodeOrNodes],
      });
      return;
    }
    const nodeOrNodes = textOrNodeOrNodes;
    if (Array.isArray(nodeOrNodes)) {
      nodeOrNodes.forEach((node) => this.add(node, escaper));
      return;
    }
    const node = nodeOrNodes;
    if (escaper) {
      this.escapers.push(escaper);
    }
    const lastEscaperLength = this.escapers.length;
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
    if (escaper) {
      assert(
        lastEscaperLength === this.escapers.length,
        "visitor did not remove added escapers!"
      );
      this.escapers.pop();
    }
  }
}

// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
const titleAdornmentCharacters = ["^", "=", "-", "~", "_", "`"];

type Visitor<Type extends MdastNodeType> = (
  context: RstContext,
  node: TypedNode<Type>,
  index: number | null,
  parent: Parent | null
) => void;

const visitors: {
  [Type in MdastNodeType]: Visitor<Type>;
} = {
  blockquote(c, node) {
    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    c.indented(node.children);
    c.addDoubleNewline();
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

    c.add(`.. code-block:: ${lang}\n\n`);
    c.indented(value);
    c.addDoubleNewline();
  },
  emphasis(c, { children }) {
    c.add("*");
    c.add(children, (text) => text.replace(/\*/g, "\\*"));
    c.add("*");
  },
  heading(c, { children, depth }) {
    c.add(children);
    c.addNewline();
    assert(1 <= depth && depth <= 6, `invalid heading depth: ${depth}`);
    c.add(new Array(4).fill(titleAdornmentCharacters[depth - 1]).join(""));
    c.addDoubleNewline();
  },
  html(c, n, i, p) {
    // TODO: handle special anchor nodes
  },
  image(c, n, i, p) {
    // TODO
  },
  inlineCode(c, { value }) {
    if (value === undefined) {
      return;
    }
    c.add(`\`\`${value}\`\``);
  },
  link(c, n) {
    // TODO: type of link (internal, external) determines syntax
    c.add(n.children);
  },
  list(c, n, i, p) {
    // TODO
  },
  listItem(c, n, i, p) {
    // TODO
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
  strike() {
    // TODO
  },
  strong(c, { children }) {
    c.add("**");
    c.add(children, (text) => text.replace(/\*/g, "\\*"));
    c.add("**");
  },
  table() {
    // TODO,
  },
  tableCell() {
    // TODO,
  },
  tableRow() {
    // TODO,
  },
  text(c, { value }) {
    if (value === undefined) {
      return;
    }
    c.add(value);
  },
};
