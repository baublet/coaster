import fs from "fs";
import path from "path";
import { LRUMap } from "lru_map";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

export function readFile(
  fullPath: string,
  args: { cache?: boolean } = { cache: false }
): Promise<string | CoasterError> {
  const resolvedPath = path.resolve(fullPath);
  const cachedValue = readFileCache.get(resolvedPath);
  if (args.cache && cachedValue) {
    return Promise.resolve(cachedValue);
  }

  return new Promise((resolve, reject) => {
    fs.readFile(resolvedPath, "utf8", (error, data) => {
      if (error) {
        reject(
          createCoasterError({
            code: "readFile",
            message: `Unexpected error reading file: ${resolvedPath}`,
            details: {
              cache: args.cache,
              fullPath,
              resolvedPath,
            },
            error,
          })
        );
      } else {
        readFileCache.set(resolvedPath, data);
        resolve(data);
      }
    });
  });
}

const readFileCache = new LRUMap<string, string>(200);
