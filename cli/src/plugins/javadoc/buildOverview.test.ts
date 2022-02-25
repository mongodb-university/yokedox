import { makeProject } from "../../makeProject.js";
import { makeJsonFs } from "../../test/makeJsonFs.js";
import { parseOverviewHtml } from "./buildOverview.js";
import { JavadocEntityData } from "./index.js";

describe("buildOverview", () => {
  it("parses overview html tags", async () => {
    const fs = makeJsonFs();
    const project = await makeProject<JavadocEntityData>({
      out: "/",
      fs,
    });
    project.declareEntity({
      canonicalName: "SomeClassA",
      pageUri: "/SomeClassA",
    });
    project.declareEntity({
      canonicalName: "SomeClassB",
      pageUri: "/SomeClassB",
    });
    const finalizedProject = await project.finalize();

    const overviewHtml = `<body>
  Please look at {@link SomeClassA}.
  And then look at {@link SomeClassB}.
  But you cannot look at {@link SomeNonexistentClass}.
</body>`;
    const md = parseOverviewHtml({
      finalizedProject,
      overviewHtml,
    });
    expect(md).toStrictEqual({
      children: [
        {
          type: "text",
          value: "Please look at ",
        },
        {
          children: [
            {
              type: "text",
              value: "SomeClassA",
            },
          ],
          entityType: "internal",
          isPending: false,
          linkText: "SomeClassA",
          targetCanonicalName: "SomeClassA",
          title: "SomeClassA",
          type: "link",
          url: "/SomeClassA#SomeClassA",
        },
        {
          type: "text",
          value: ". And then look at ",
        },
        {
          children: [
            {
              type: "text",
              value: "SomeClassB",
            },
          ],
          entityType: "internal",
          isPending: false,
          linkText: "SomeClassB",
          targetCanonicalName: "SomeClassB",
          title: "SomeClassB",
          type: "link",
          url: "/SomeClassB#SomeClassB",
        },
        {
          type: "text",
          value: ". But you cannot look at ",
        },
        {
          children: [
            {
              type: "text",
              value: "SomeNonexistentClass",
            },
          ],
          isPending: true,
          linkText: "SomeNonexistentClass",
          targetCanonicalName: "SomeNonexistentClass",
          type: "linkToEntity",
        },
        {
          type: "text",
          value: ".",
        },
      ],
      position: {
        end: {
          column: 8,
          line: 5,
          offset: 145,
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
});
