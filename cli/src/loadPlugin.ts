import * as Path from "path";
import { Plugin } from "./Plugin";

const pluginsByGeneratorName = new Map<string, Plugin>();

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
    const result = pluginsByGeneratorName.get(generatorName);
    if (result === undefined) {
      throw new Error(
        `Could not load plugin for generator '${generatorName}' (given generator path '${generator}'). Try specifying plugin path with --plugin.`
      );
    }
    return result;
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
  const plugin = (await import(absolutePath)) as Plugin;

  if (typeof plugin.run !== "function") {
    throw new Error(
      `loading plugin '${pluginPath}': expected function run(args) to be exported`
    );
  }

  return plugin;
}
