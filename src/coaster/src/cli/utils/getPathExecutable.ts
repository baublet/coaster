import { readFile } from "@baublet/coaster-fs";

export async function getPathExecutable(path: string): Promise<string> {
  const fileContents = await readFile(path);
  const firstLine = fileContents.toString().split("\n")[0];
  const shebang = firstLine.match(/^#!(.*)$/);
  if (shebang) {
    return shebang[1];
  }
  return "node";
}
