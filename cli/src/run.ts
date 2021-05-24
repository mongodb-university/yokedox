import tmp from "tmp-promise";
import { Diagnostic } from "./Diagnostic";
import { Entity } from "./Entity";
import { loadPlugin } from "./loadPlugin";
import { Page } from "./Page";

/**
  Arguments passed to the run command.
 */
export interface RunArgs {
  /**
    Name of or path to generator executable.
   */
  generator: string;

  /**
    Arguments after end-of-options flag (--) to be passed to the generator.
   */
  generatorArgs: (string | number)[];

  /**
    Path to plugin.
   */
  plugin?: string;

  /**
    Output path.
   */
  out?: string;
}

/**
  Runs a given generator in the current working directory.
 */
export const run = async (args: RunArgs): Promise<void> => {
  // Validate and open output location, set up output functions
  const { onDiagnostic, onEntity, onPage } = await createOutputCallbacks(args);

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
      generator: args.generator,
      generatorArgs: args.generatorArgs,
      tempDir: tempDir.path,
      onDiagnostic,
      onEntity,
      onPage,
    });
  } finally {
    // This should not be needed according the tmp-promise library README, but
    // local testing indicates otherwise.
    await tempDir.cleanup();
  }
};

async function createOutputCallbacks({ out }: { out?: string }): Promise<{
  onDiagnostic(diagnostic: Diagnostic): void;
  onEntity(entity: Entity): void;
  onPage(page: Page): void;
}> {
  return {
    onDiagnostic(diagnostic) {
      // TODO
    },
    onEntity(entity) {
      // TODO
    },
    onPage(page) {
      // TODO
    },
  };
}
