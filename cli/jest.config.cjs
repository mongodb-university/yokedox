module.exports = {
  preset: "ts-jest",
  testRegex: "\\.test\\.ts$",
  modulePathIgnorePatterns: ["<rootDir>/build"],
  // unist-util libraries like ESM - add exclusions to ignore patterns here
  transformIgnorePatterns: ["node_modules/(?!unist-)"],
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
    "\\.(js|jsx)$": "babel-jest",
  },
};
