import * as Path from "path";
import { cliSourceDirectory } from "./cliSourceDirectory.js";
import { loadPlugin } from "./loadPlugin.js";
import Javadoc from "./plugins/javadoc/index.js";
import TestPlugin from "./test/testPlugin.js";

describe("loadPlugin", () => {
  it("loads built-in plugins", async () => {
    const plugin = await loadPlugin({ generator: "javadoc" });
    expect(plugin).toStrictEqual(Javadoc);
  });

  it("validates plugins", async () => {
    await expect(
      loadPlugin({
        generator: "test",
        plugin: Path.join(cliSourceDirectory, "test", "badPlugin"),
      })
    ).rejects.toThrow("No default export found in plugin");
  });

  it("loads plugins from path", async () => {
    await expect(
      loadPlugin({
        generator: "test",
        plugin: Path.join(cliSourceDirectory, "test", "nonExistentPlugin"),
      })
    ).rejects.toThrow("Cannot find module");
    const plugin = await loadPlugin({
      generator: "test",
      plugin: Path.join(cliSourceDirectory, "test", "testPlugin"),
    });
    expect(plugin).toStrictEqual(TestPlugin);
  });
});
