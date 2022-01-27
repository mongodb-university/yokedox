import confyglot from "confyglot";
import { ExternalEntityPattern } from "./addExternalEntityTransformer.js";

export type RunConfiguration = {
  externalEntityPatterns?: ExternalEntityPattern[];
};

/**
  Loads the yokedox configuration file (if any) from the current working directory.
 */
export async function loadConfiguration(): Promise<RunConfiguration> {
  return (
    (await confyglot.load<RunConfiguration>(process.cwd(), {
      configPrefix: ".yokedox",
      schema: {
        type: "object",
        properties: {
          externalEntityPatterns: {
            type: "array",
            items: {
              type: "object",
              required: ["from", "toPrefix"],
              properties: {
                from: {
                  type: "string",
                },
                toPrefix: {
                  type: "string",
                },
                toSuffix: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    })) ?? {}
  );
}
