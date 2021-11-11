import { strict as assert } from "assert";
import yargs from "yargs";
import { run } from "./run.js";

/**
  cli is a function that processes command line arguments. Without args, uses
  process.argv.slice(2), i.e. command line args. You can also pass an array of
  strings as command line args.
 */
export const cli = yargs
  .command(
    "run <generator>",
    "process with a docs generator",
    (yargs) => {
      return yargs
        .positional("generator", {
          describe: "path or name of generator executable",
          type: "string",
        })
        .option("plugin", {
          alias: "p",
          string: true,
          describe: "path to plugin",
        })
        .option("out", {
          alias: "o",
          string: true,
          describe: "output path",
        })
        .option("outputMdastJson", {
          boolean: true,
          describe: "whether to output mdast json files",
        })
        .option("outputRst", {
          boolean: true,
          describe: "whether to output rST files",
        })
        .option("debugGeneratorResultPath", {
          string: true,
          describe:
            "bypass the generator step and treat the given path as the result of a generator call",
        })
        .option("enableDuplicateEntityWarning", {
          boolean: true,
          describe:
            "output information about duplicate entities generated internally",
        });
    },
    (args) => {
      assert(args.generator !== undefined);
      run({
        ...args,
        generator: args.generator, // strict null check
        generatorArgs: args._.slice(1),
      });
    }
  )
  .help()
  .demandCommand().parse;
