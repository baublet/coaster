import path from "path";
import { execa } from "execa";

const testRunnerPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  "vitest"
);

const additionalArguments: string[] = [];

if (!process.argv.includes("--watch")) {
  additionalArguments.push("run");
}

execa("node", [testRunnerPath, ...additionalArguments], {
  all: true,
  cwd: process.cwd(),
  env: process.env,
  argv0: process.argv0,
  stdio: "inherit",
});
