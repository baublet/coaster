import path from "path";
import { fileURLToPath } from "url";

import { execa } from "execa";

import { getPathExecutable } from "@baublet/coaster-build-tools";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

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

if (!process.argv.includes("--coverage")) {
  additionalArguments.push("--coverage");
}

getPathExecutable(testRunnerPath)
  .then((executable) => {
    execa(executable, [testRunnerPath, ...additionalArguments], {
      all: true,
      cwd: process.cwd(),
      env: process.env,
      argv0: process.argv0,
      stdio: "inherit",
    });
  })
  .catch((error) => {
    console.error(error);
  });
