import fs from "fs";
import path from "path";
import { LRUMap } from "lru_map";

export function readFile(
  fullPath: string,
  args: { cache?: boolean } = { cache: false }
): Promise<string> {
  const resolvedPath = path.resolve(fullPath);
  const cachedValue = readFileCache.get(resolvedPath);
  if (args.cache && cachedValue) {
    return Promise.resolve(cachedValue);
  }

  return new Promise((resolve, reject) => {
    fs.readFile(resolvedPath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        readFileCache.set(resolvedPath, data);
        resolve(data);
      }
    });
  });
}

const readFileCache = new LRUMap<string, string>(200);
