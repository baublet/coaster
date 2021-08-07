module.exports = {
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src/"],
  testPathIgnorePatterns: ["/node_modules/", ".*.integration.test.ts", "tmp/*"],
  preset: "ts-jest",
  coverageThreshold: {
    global: {
      functions: 100,
    },
  },
};
