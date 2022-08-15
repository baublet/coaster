import fs from "fs";
import path from "path";
import { LRUMap } from "lru_map";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

export function readDir(
  fullPath: string,
  args: { cache?: boolean } = { cache: false }
): Promise<string[] | CoasterError> {
  const resolvedPath = path.resolve(fullPath);
  const cachedValue = readDirCache.get(resolvedPath);
  if (args.cache && cachedValue) {
    return Promise.resolve(cachedValue);
  }

  return new Promise((resolve) => {
    fs.readdir(resolvedPath, "utf8", (error, data) => {
      if (error) {
        return resolve(
          createCoasterError({
            code: "readFile",
            message: `Unexpected error reading directory: ${resolvedPath}`,
            details: {
              cache: args.cache,
              fullPath,
              resolvedPath,
            },
            error,
          })
        );
      }
      readDirCache.set(resolvedPath, data);
      resolve(data);
    });
  });
}

const readDirCache = new LRUMap<string, string[]>(200);
