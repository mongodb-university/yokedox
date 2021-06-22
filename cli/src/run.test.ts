import { run } from "./run.js";

describe("run", () => {
  it("throws on unknown generator", async () => {
    await expect(
      run({
        generatorArgs: [],
        generator: "unknown",
      })
    ).rejects.toThrow("Cannot find module");
  });
});
