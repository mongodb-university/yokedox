import { parseHtmlToMdast } from "./parseHtmlToMdast.js";

describe("parseHtmlToMdast", () => {
  // If html is spread over many text nodes, the closing tag may be in a
  // separate node than the one being processed.
  it("accepts unclosed tags", () => {
    const mdast = parseHtmlToMdast("<b>This is an unclosed tag");
    expect(mdast).toStrictEqual({
      children: [
        {
          children: [
            {
              position: {
                end: {
                  column: 27,
                  line: 1,
                  offset: 26,
                },
                start: {
                  column: 4,
                  line: 1,
                  offset: 3,
                },
              },
              type: "text",
              value: "This is an unclosed tag",
            },
          ],
          position: {
            end: {
              column: 27,
              line: 1,
              offset: 26,
            },
            start: {
              column: 1,
              line: 1,
              offset: 0,
            },
          },
          type: "strong",
        },
      ],
      position: {
        end: {
          column: 27,
          line: 1,
          offset: 26,
        },
        start: {
          column: 1,
          line: 1,
          offset: 0,
        },
      },
      type: "root",
    });
  });

  it("ignores unopened close tags", () => {
    const mdast = parseHtmlToMdast("</b>");
    expect(mdast).toStrictEqual({
      children: [],
      type: "root",
    });
  });
});
