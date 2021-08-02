import gfm from "remark-gfm";
import parse from "remark-parse";
import unified from "unified";
import { mdastRstStringify } from "./mdastToRst.js";

describe("mdastToRst", () => {
  it("converts mdast to reStructuredText", () => {
    const markdown = `# This is a heading

Here is some *text* with an [external link](https://example.com) and an [anchor link](#anchorLink).

<a name="anchorLink"></a>

## Anchored subheading

>It's a **blockquote.**

\`\`\`java
This is a codeblock.
\`\`\`

## Tables

| test | test2 | test3 | test4 | test5 |
|------|-------|-------|-------|-------|
| 1    | 2     | 3     | 4     | 5     |
| 6    | 7     | 8     | 9     | 10    |
| 11   | 12    | 13    | 14    | 15    |
`;

    const rstFile = unified()
      .use(parse)
      .use(gfm)
      .use(mdastRstStringify)
      .processSync(markdown);
    expect(rstFile.contents).toBe(`This is a heading
^^^^^^^^^^^^^^^^^

Here is some *text* with an \`external link <https://example.com>\`__ and an :ref:\`anchor link <anchorLink>\`.

.. _anchorLink:

Anchored subheading
===================


   It's a **blockquote.**
   
   
.. code-block:: java

   This is a codeblock.

Tables
======

.. list-table::
   :header-rows: 1
   
   * - test
     - test2
     - test3
     - test4
     - test5
   
   * - 1
     - 2
     - 3
     - 4
     - 5
   
   * - 6
     - 7
     - 8
     - 9
     - 10
   
   * - 11
     - 12
     - 13
     - 14
     - 15
   
   

`);
  });
});
