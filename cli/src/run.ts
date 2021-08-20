import tmp from "tmp-promise";
import { loadPlugin } from "./loadPlugin.js";
import { makeProject, MakeProjectArgs } from "./makeProject.js";
import { PluginArgs } from "./Plugin.js";
/**
  Arguments passed to the run command.
 */
export type RunArgs = Omit<PluginArgs, "tempDir" | "project"> &
  MakeProjectArgs & {
    /**
    Path to plugin.
   */
    plugin?: string;
  };

/**
  Runs a given generator in the current working directory.
 */
export const run = async (args: RunArgs): Promise<void> => {
  // Validate and open output location, set up output functions
  const project = await makeProject(args);

  // Load the plugin
  const plugin = await loadPlugin(args);

  // Create a self-cleaning temporary directory
  const tempDir = await tmp.dir({
    unsafeCleanup: true,
    prefix: "yokedox",
  });

  try {
    // Delegate to plugin
    await plugin.run({
      ...args,
      project,
      tempDir: tempDir.path,
    });
  } finally {
    // This should not be needed according the tmp-promise library README, but
    // local testing indicates otherwise.
    await tempDir.cleanup();
  }
};
