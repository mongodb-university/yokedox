import { makeProject } from "../../makeProject.js";
import { makeJsonFs } from "../../test/makeJsonFs.js";
import { buildOverview, parseOverviewHtml } from "./buildOverview.js";
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

  it("uses the given project title in the heading", async () => {
    const fs = makeJsonFs();
    const testTitle = "This is a test title";
    const project = await makeProject<JavadocEntityData>({
      title: testTitle,
      out: "/",
      fs,
    });
    const finalizedProject = await project.finalize();
    await buildOverview({ finalizedProject });
    await expect(
      (async () => {
        const data = JSON.parse(await fs.readFile("/index.json", "utf8"));
        return data.root.children[0];
      })()
    ).resolves.toMatchObject({
      type: "heading",
      children: [
        {
          type: "text",
          value: testTitle,
        },
      ],
    });
  });

  it("uses a default project title if none given", async () => {
    const fs = makeJsonFs();
    const project = await makeProject<JavadocEntityData>({
      out: "/",
      fs,
    });
    const finalizedProject = await project.finalize();
    await buildOverview({ finalizedProject });
    await expect(
      (async () => {
        const file = await fs.readFile("/index.json", "utf8");
        const data = JSON.parse(file);
        return data.root.children[0];
      })()
    ).resolves.toMatchObject({
      type: "heading",
      children: [
        {
          type: "text",
          value: "API Reference",
        },
      ],
    });
  });
});
