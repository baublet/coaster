module.exports = {
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  coverageThreshold: {
    global: {
      functions: 100,
    },
  },
};
