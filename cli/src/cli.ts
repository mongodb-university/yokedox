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
        });
    },
    (args) => {
      assert(args.generator !== undefined);
      run({
        generator: args.generator,
        plugin: args.plugin,
        generatorArgs: args._.slice(1),
        out: args.out,
      });
    }
  )
  .help()
  .demandCommand().parse;
