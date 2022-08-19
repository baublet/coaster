import { build } from "esbuild";

import { copy } from "fs-extra";
import path from "path";
import readDir from "recursive-readdir";

const currentDirectory = process.cwd();
const sourceDirectory = path.join(currentDirectory, "src");
const distDirectory = path.join(currentDirectory, "dist");

(async () => {
  console.log("Copying files");
  await copy(sourceDirectory, distDirectory);

  console.log("Discovering files");
  const files = await readDir(distDirectory);

  console.log(`Filtering ${files.length} files`);
  const filteredFiles = files.filter((file) => file.endsWith(".ts"));

  if (!filteredFiles.length) {
    console.log("Nothing to build");
    process.exit(0);
  }

  console.log(`Transpiling ${filteredFiles.length} files`);

  await build({
    outdir: distDirectory,
    entryPoints: filteredFiles,
    absWorkingDir: process.cwd(),
  });
})()
  .then(() => {})
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
