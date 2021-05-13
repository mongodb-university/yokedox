import * as Path from "path";
import { loadPlugin } from "./loadPlugin";
import Javadoc from "./plugins/javadoc";
import TestPlugin from "./test/testPlugin";

describe("loadPlugin", () => {
  it("loads built-in plugins", async () => {
    const plugin = await loadPlugin({ generator: "javadoc" });
    expect(plugin).toStrictEqual(Javadoc);
  });

  it("validates plugins", async () => {
    await expect(
      loadPlugin({
        generator: "test",
        plugin: Path.join(__dirname, "test", "badPlugin"),
      })
    ).rejects.toThrow(
      "expected function run(args) on exported default object, but no such function found."
    );
  });

  it("loads plugins from path", async () => {
    await expect(loadPlugin({
      generator: "test",
      plugin: Path.join(__dirname, "test", "nonExistentPlugin"),
    })).rejects.toThrow("Cannot find module");
    const plugin = await loadPlugin({
      generator: "test",
      plugin: Path.join(__dirname, "test", "testPlugin"),
    })
    expect(plugin).toStrictEqual(TestPlugin);
  });
});
