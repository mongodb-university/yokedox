import * as Path from "path";
import { makeProject } from "./makeProject";
import { md } from "./mdast";
import { Page } from "./Page";
import { makeJsonFs } from "./test/makeJsonFs";

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
      new Page("/index", md.root([md.heading(1, md.text("heading"))]))
    );

    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[{"type":"heading","children":[{"type":"text","value":"heading"}],"depth":1}]}}'
    );

    await project.writePage(
      new Page("/file2", md.root([project.makeInternalLink("/index")]))
    );

    await expect(fs.readFile("/file2.json", "utf8")).resolves.toBe(
      '{"path":"/file2","root":{"type":"root","children":[{"type":"link","children":[],"url":"/index","title":"","isInternalLink":true}]}}'
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
      new Page("/index", md.root([project.makeInternalLink("/foo#bar")]))
    );

    await expect(fs.readFile("/index.json", "utf8")).rejects.toThrow(
      "ENOENT: no such file or directory, open '/index.json'"
    );

    // This page adds the page/anchor
    await project.writePage(
      new Page("/foo", md.root([project.makeAnchor("bar")]))
    );

    await expect(fs.readFile("/foo.json", "utf8")).resolves.toBe(
      '{"path":"/foo","root":{"type":"root","children":[{"type":"html","value":"<a name=\\"bar\\" ></a>","anchorName":"bar"}]}}'
    );

    // Finalize flushes remaining pages
    await project.finalize();

    // Finalized with resolved links
    await expect(fs.readFile("/index.json", "utf8")).resolves.toBe(
      '{"path":"/index","root":{"type":"root","children":[{"type":"link","children":[],"url":"/foo#bar","title":"","isInternalLink":true}]}}'
    );
  });

  it("reports errors if links never resolved", async () => {
    const fs = makeJsonFs();
    const project = await makeProject({ out: "/", fs });

    // This page refers to a page/anchor that doesn't exist yet
    await project.writePage(
      new Page("/index", md.root([project.makeInternalLink("/foo#bar")]))
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
      '{"path":"/index","root":{"type":"root","children":[{"type":"link","children":[],"url":"/foo#bar","title":"","isInternalLink":true}]}}'
    );
  });
});
