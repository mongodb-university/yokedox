import child_process from "child_process";
import { ChildProcess } from "./ChildProcess";
import { loadPlugin } from "./loadPlugin";

/**
  Arguments passed to the run command.
 */
export interface RunArgs {
  /**
    Name of or path to generator executable.
   */
  generator: string;

  /**
    Arguments after end-of-options flag (--)
   */
  argsAfterOptions: (string | number)[];

  /**
    Path to plugin.
   */
  plugin?: string;

  /**
    Output path.
   */
  out?: string;

  /**
    The child process interface to use.
   */
  child_process?: ChildProcess;
}

/**
  Runs a given generator in the current working directory.
 */
export const run = async (args: RunArgs): Promise<void> => {
  // 0. Validate and open output location, set up writePage function

  // 1. Find plugin
  const plugin = await loadPlugin(args);

  // 2. Set up temporary directory

  // 3. Pass args, output interface, and child_process interface to plugin
  const result = await plugin.run({
    generator: args.generator,
    generatorArgs: args.argsAfterOptions,
    child_process: args.child_process ?? child_process,
    tempDir: "", // TODO
    onDiagnostic(diagnostic) {
      // TODO
    },
    onEntity(entity) {
      // TODO
    },
    onPage(page) {
      // TODO
    },
  });

  // 4. Clean up temporary dir
};
