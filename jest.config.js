module.exports = {
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src/"],
  testPathIgnorePatterns: ["/node_modules/", ".*.integration.test.ts"],
  preset: "ts-jest",
  coverageThreshold: {
    global: {
      functions: 100,
    },
  },
};
