import * as Path from "path";
import { makeProject } from "./makeProject.js";
import { Page } from "./Page.js";
import { makeJsonFs } from "./test/makeJsonFs.js";
import { md } from "./yokedast.js";

describe("makeProject", () => {
  it("throws on invalid directory", async () => {
    const fs = makeJsonFs({
      "/not-a-directory.txt": "this is the only file on the filesystem",
    });

    // Out path must exist
    await expect(
      makeProject({ out: "/some/nonexistent/directory", fs })
    ).rejects.toThrow(
      "ENOENT: no such file or directory, lstat '/some/nonexistent/directory'"
    );

    // Out path must be a directory
    await expect(
      makeProject({ out: "/not-a-directory.txt", fs })
    ).rejects.toThrow("output path '/not-a-directory.txt' is not a directory!");
  });

  it("accepts relative output paths", async () => {
    const fs = makeJsonFs({});
    await expect(
      // Use a relative path
      makeProject({ out: "not/a/real/directory", fs })
    ).rejects.toThrow(
      // Use resolve() to get the actual cwd in the virtual filesystem
      `ENOENT: no such file or directory, lstat '${Path.resolve(
        "not/a/real/directory"
      )}'`
    );
  });

  it("writes pages when all links are resolved", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });
    await project.writePage(
      new Page(
        "/index",
        md.root([
          project.declareEntity({
            canonicalName: "index",
            pageUri: "/index",
          }),
          md.heading(1, md.text("heading")),
        ])
      )
    );

    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[{"type":"html","value":"<a name=\\"index\\" ></a>","anchorName":"index","entity":{"canonicalName":"index","pageUri":"/index","isExternal":false}},{"type":"heading","children":[{"type":"text","value":"heading"}],"depth":1}]}}'
    );

    await project.writePage(
      new Page("/file2", md.root([project.linkToEntity("index")]))
    );

    await expect(fs.readFile("/file2.json", "utf8")).resolves.toBe(
      '{"path":"/file2","root":{"type":"root","children":[{"type":"link","children":[{"type":"text","value":"index"}],"url":"/index#index","title":"index","linkText":"index","targetCanonicalName":"index","isPending":false,"isExternal":false}]}}'
    );
  });

  it("creates subdirectories if needed", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });
    await project.writePage(new Page("/path/to/index", md.root()));
    await project.writePage(new Page("/path/to/another/index", md.root()));
    await expect(fs.readFile("/path/to/index.json", "utf8")).resolves.toBe(
      '{"path":"/path/to/index","root":{"type":"root","children":[]}}'
    );
    await expect(
      fs.readFile("/path/to/another/index.json", "utf8")
    ).resolves.toBe(
      '{"path":"/path/to/another/index","root":{"type":"root","children":[]}}'
    );
  });

  it("defers writing pages until links are resolved", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });

    // This page refers to a page/anchor that doesn't exist yet
    await project.writePage(
      new Page("/index", md.root([project.linkToEntity("bar")]))
    );

    await expect(fs.readFile("/index.json", "utf8")).rejects.toThrow(
      "ENOENT: no such file or directory, open '/index.json'"
    );

    // This page adds the page/anchor
    await project.writePage(
      new Page(
        "/foo",
        md.root([
          project.declareEntity({
            canonicalName: "bar",
            pageUri: "/foo",
          }),
        ])
      )
    );

    await expect(fs.readFile("/foo.json", "utf8")).resolves.toBe(
      '{"path":"/foo","root":{"type":"root","children":[{"type":"html","value":"<a name=\\"bar\\" ></a>","anchorName":"bar","entity":{"canonicalName":"bar","pageUri":"/foo","isExternal":false}}]}}'
    );

    // Finalize flushes remaining pages
    await project.finalize();

    // Finalized with resolved links
    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[{"type":"link","children":[{"type":"text","value":"bar"}],"targetCanonicalName":"bar","isPending":false,"linkText":"bar","url":"/foo#bar","title":"bar","isExternal":false}]}}'
    );
  });

  it("reports errors if links never resolved", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });

    // This page refers to a page/anchor that doesn't exist yet
    await project.writePage(
      new Page("/index", md.root([project.linkToEntity("/foo#bar")]))
    );

    await expect(fs.readFile("/index.json", "utf8")).rejects.toThrow(
      "ENOENT: no such file or directory, open '/index.json'"
    );

    // This page adds the page but not the anchor
    await project.writePage(new Page("/foo", md.root()));
    await expect(fs.readFile("/foo.json", "utf8")).resolves.toBe(
      '{"path":"/foo","root":{"type":"root","children":[]}}'
    );

    // Finalize flushes remaining pages
    await project.finalize();

    // Finalized with broken links
    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[{"type":"strong","children":[{"type":"text","value":"/foo#bar"},{"type":"text","value":" (?)"}],"targetCanonicalName":"/foo#bar","isPending":true,"linkText":"/foo#bar"}]}}'
    );
  });

  it("asks for extra pages at finalize", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });
    project.declareEntity({
      canonicalName: "SomeClassA",
      pageUri: "/SomeClassA",
    });
    project.declareEntity({
      canonicalName: "SomeClassB",
      pageUri: "/SomeClassB",
    });
    const finalizedProject = await project.finalize();

    expect(finalizedProject.entities.map((e) => e.canonicalName)).toStrictEqual(
      ["SomeClassA", "SomeClassB"]
    );

    await project.writePage({
      path: "/index",
      root: md.root(),
    });
    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[]}}'
    );
  });

  it("supports external entities", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });
    project.addExternalEntityTransformer((canonicalName) => {
      return /^ext\./.test(canonicalName)
        ? {
            isExternal: true,
            pageUri: `https://example.com/${canonicalName}`,
            canonicalName,
          }
        : undefined;
    });
    await project.writePage(
      new Page(
        "/index",
        md.root([
          project.linkToEntity("ext.something"),
          project.linkToEntity("int.something"),
        ])
      )
    );
    await project.finalize();

    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[{"type":"link","children":[{"type":"text","value":"ext.something"}],"targetCanonicalName":"ext.something","isPending":false,"linkText":"ext.something","url":"https://example.com/ext.something","title":"ext.something","isExternal":true},{"type":"strong","children":[{"type":"text","value":"int.something"},{"type":"text","value":" (?)"}],"targetCanonicalName":"int.something","isPending":true,"linkText":"int.something"}]}}'
    );
  });
});
