import { Project } from "./Project.js";

/**
  Converts docs generator tool output to Yokedox-friendly output.
 */
export type Plugin<UserDataType = unknown> = {
  /**
    Entrypoint for plugin.
    
    Throw Error to report errors.
   */
  run(args: PluginArgs<UserDataType>): Promise<void> | void;
};

/**
  Passed to a plugin's run() function.
 */
export type PluginArgs<UserDataType = unknown> = {
  /**
    The project to write to.

    As the sole writer to the project, the plugin can safely cast the Project to
    a specific Project<PluginUserData> type. This keeps entity user data typed.
   */
  project: Project<UserDataType>;

  /**
    The generator executable path.
   */
  generator: string;

  /**
    The path to the temporary working directory. Plugins may freely write within
    this directory, but should not delete the directory itself. No cleanup
    necessary.
   */
  tempDir: string;

  /**
    Additional CLI arguments to be forwarded to the generator. Plugins may
    modify these arguments as needed.
   */
  generatorArgs: (string | number)[];

  /**
    If set, plugins should bypass the generator step and treat the given path as
    containing the result of a generator call.
   */
  debugGeneratorResultPath?: string;

  /**
    Additional path to use when building indexes.
   */
  indexPathPrefix?: string;
};
