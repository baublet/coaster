module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/integration"],
  modulePaths: ["<rootDir>/src/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
