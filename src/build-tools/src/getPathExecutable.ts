import fs from "fs";

/**
 * Given a path to plain-text script of some sort, returns the path of the executable
 * to run the script. If we can't figure it out, we just return "node".
 */
export async function getPathExecutable(path: string): Promise<string> {
  const fileContents = await fs.readFileSync(path, "utf8");
  const firstLine = fileContents.toString().split("\n")[0];
  const shebang = firstLine.match(/^#!(.*)$/);
  if (shebang) {
    return shebang[1];
  }
  return "node";
}
