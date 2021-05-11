import { ChildProcess } from "./ChildProcess";
import { Diagnostic } from "./Diagnostic";
import { Entity } from "./Entity";
import { Page } from "./Page";

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
    The interface to the shell. Plugins should use this instead of their own
    imports of child_process.
   */
  child_process: ChildProcess;

  /**
    Additional CLI arguments to be forwarded to the generator. Plugins may
    modify these arguments as needed.
   */
  generatorArgs: (string | number)[];

  /**
    To be called when an entity is discovered.
   */
  onEntity(entity: Entity): void;

  /**
    To be called when a page is complete and ready to be committed to the
    output.
   */
  onPage(page: Page): void;

  /**
    To be called when a non-fatal warning or error is encountered.
   */
  onDiagnostic(diagnostic: Diagnostic): void;
};
