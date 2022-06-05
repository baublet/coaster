import { spawn } from "child_process";

const start = process.hrtime();

const command = spawn("node", ["node_modules/.bin/vitest"], {
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

command.on("close", () => {
  const stop = process.hrtime(start);
  console.log(`${(stop[0] * 1e9 + stop[1]) / 1e9}s`);
});
