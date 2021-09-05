module.exports = {
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src/"],
  testPathIgnorePatterns: ["/node_modules/", ".*.integration.test.ts", "tmp/*"],
  preset: "ts-jest",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "index.ts",
    "/scripts/.+.ts",
    "/migrations/.+.ts",
    ".+.test.ts",
    ".+.tpl.ts",
    // Tested separately
    "/generateORM\\/drivers\\/postgres/",
    "src\\/generateORM\\/integrationTests",
  ],
  collectCoverageFrom: ["**/helpers/*.ts", "**/*.ts", "!**/node_modules/**"],
  coverageThreshold: {
    global: {
      functions: 100,
      branches: 100,
      lines: 100,
    },
  },
};
