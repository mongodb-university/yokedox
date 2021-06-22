import { Project } from "./Project.js";

/**
  Converts docs generator tool output to Yokedox-friendly output.
 */
export type Plugin = {
  /**
    Entrypoint for plugin.
    
    Throw Error to report errors.
   */
  run(args: PluginArgs): Promise<void> | void;
};

/**
  Passed to a plugin's run() function.
 */
export type PluginArgs = {
  /**
    The project to write to.
   */
  project: Project;

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
};
