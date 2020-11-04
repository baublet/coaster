module.exports = {
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src/"],
  preset: "ts-jest",
  coverageThreshold: {
    global: {
      functions: 100,
    },
  },
};
