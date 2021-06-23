import * as Path from "path";
import { cliSourceDirectory } from "./cliSourceDirectory.js";
import { Plugin } from "./Plugin.js";

/**
  Loads the plugin corresponding to the given generator or from the specified
  path if a path is provided.
 */
export const loadPlugin = async ({
  plugin,
  generator,
}: {
  plugin?: string;
  generator: string;
}): Promise<Plugin> => {
  if (plugin === undefined) {
    const generatorName = Path.basename(generator);
    // Try to load from the built-in plugins directory.
    return loadPluginAtPath(
      Path.join(cliSourceDirectory, "plugins", generatorName, "index.js")
    );
  }
  return loadPluginAtPath(plugin);
};

/**
  Load the given plugin from the filesystem.
 */
async function loadPluginAtPath(pluginPath: string): Promise<Plugin> {
  // Convert potentially relative path (from user's cwd) to absolute path -- as
  // import() expects relative paths from bin directory
  const absolutePath = Path.resolve(pluginPath);

  const plugin = (await import(absolutePath)).default as Plugin;

  if (plugin === undefined) {
    throw new Error(
      `No default export found in plugin '${pluginPath}'. Did you default export the plugin object?`
    );
  }

  if (typeof plugin.run !== "function") {
    throw new Error(
      `Failed to load plugin '${pluginPath}': expected function run(args) on exported default object, but no such function found.`
    );
  }

  return plugin;
}
