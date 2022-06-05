import path from "path";
import { spawn } from "child_process";

const start = process.hrtime();

const testRunnerPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  "vitest"
);

const command = spawn("node", [testRunnerPath, "run"], {
  cwd: process.cwd(),
  env: process.env,
  argv0: process.argv0,
});

command.stdout.on("data", (data) => {
  process.stdout.write(data);
});

command.stderr.on("data", (data) => {
  process.stderr.write(data);
});

command.on("close", (code) => {
  const stop = process.hrtime(start);
  console.log(`${(stop[0] * 1e9 + stop[1]) / 1e9}s`);
  process.exit(code);
});
