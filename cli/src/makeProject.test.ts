import * as Path from "path";
import { makeProject } from "./makeProject";
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
});
