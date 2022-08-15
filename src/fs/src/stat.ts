import fs from "fs";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

export function stat(fileFullPath: string): Promise<fs.Stats | CoasterError> {
  return new Promise((resolve) => {
    fs.stat(fileFullPath, function existsSyncStatCallback(error, stats) {
      if (error == null) {
        return resolve(stats);
      } else if (error.code === "ENOENT") {
        return resolve(
          createCoasterError({
            code: "stat-file-not-found",
            message: "File or directory does not exist: " + fileFullPath,
          })
        );
      }

      resolve(
        createCoasterError({
          code: "stat-unexpected",
          message: "Unexpected error accessing filesystem: " + error.message,
        })
      );
    });
  });
}
