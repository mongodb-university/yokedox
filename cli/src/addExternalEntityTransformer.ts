import { Project } from "./Project.js";

/**
  Convenience function for building external entities where the canonical name
  is a part of the URI on an external docs site.

  Entity names that match the given regex are added as external entities with a
  pageUri constructed by the given pageUri function.
 */
export function addExternalEntityTransformer(
  project: Project,
  canonicalNameRegex: RegExp,
  getPageUri: (canonicalName: string) => string
): void {
  project.addEntityTransformer((canonicalName) => {
    if (!canonicalNameRegex.test(canonicalName)) {
      return undefined;
    }
    return {
      type: "external",
      canonicalName,
      pageUri: getPageUri(canonicalName),
    };
  });
}

/**
  Adds an external entity transformer that links canonical names that match the
  given pattern to an external URI constructed by concatenating the three
  elements: toPrefix; path formed from the canonical name by replacing all dots
  (.) with slashes (/); and the (optional) toSuffix.
 */
export function addExternalEntityPattern(
  project: Project,
  { from, toPrefix, toSuffix }: ExternalEntityPattern
): void {
  addExternalEntityTransformer(
    project,
    new RegExp(from),
    (canonicalName) =>
      `${toPrefix}${canonicalName.split(".").join("/")}${toSuffix ?? ""}`
  );
}

/**
  Specifies a pattern to match against entity canonical names and what external
  site to link to with matching names.
 */
export type ExternalEntityPattern = {
  from: string | RegExp;
  toPrefix: string;
  toSuffix?: string;
};
