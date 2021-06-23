export default {
  globals: {
    extensionsToTreatAsEsm: [".ts"],
    "ts-jest": {
      useESM: true,
    },
  },
  preset: "ts-jest/presets/js-with-ts-esm",
  testRegex: "\\.test\\.ts$",
  modulePathIgnorePatterns: ["<rootDir>/build"],
  moduleNameMapper: {
    "^(\\.\\.?/.*).js$": ["$1"],
    "^(\\/.*plugins/.*).js$": ["$1.ts"],
  },
};
