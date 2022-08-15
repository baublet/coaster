import path from "path";

import {
  asyncForEach,
  CoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";

import { readDir } from "./readDir";
import { stat } from "./stat";

type Aggregates = { files: Set<string>; directories: Set<string> };

export function getAllFilesInDirectoryRecursively(
  dirPath: string,
  aggregates: Aggregates = {
    files: new Set(),
    directories: new Set(),
  }
): Promise<string[] | CoasterError> {
  return new Promise((resolve) => {
    (async () => {
      const result = await addDirectoryToAggregate(dirPath, aggregates);
      if (isCoasterError(result)) {
        return resolve(result);
      }
      resolve(Array.from(aggregates.files));
    })();
  });
}

function addDirectoryToAggregate(
  currentFileFullPath: string,
  aggregates: Aggregates
): Promise<void | CoasterError> {
  let hasResolved = false;

  return new Promise((resolve) => {
    (async () => {
      const files = await readDir(currentFileFullPath);

      if (isCoasterError(files)) {
        hasResolved = true;
        return resolve(files);
      }

      await asyncForEach(files, async (file) => {
        if (hasResolved) {
          return;
        }

        const filePath = path.join(currentFileFullPath, file);
        const stats = await stat(filePath);

        if (isCoasterError(stats)) {
          hasResolved = true;
          return resolve(stats);
        }

        if (stats.isDirectory()) {
          if (aggregates.directories.has(filePath)) {
            return;
          }
          aggregates.directories.add(filePath);
          const result = await addDirectoryToAggregate(filePath, aggregates);
          if (isCoasterError(result)) {
            hasResolved = true;
            return resolve(result);
          }
        } else {
          aggregates.files.add(filePath);
        }
      });

      if (hasResolved) {
        return;
      }
      hasResolved = true;
      resolve();
    })();
  });
}
