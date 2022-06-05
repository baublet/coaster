import fs from "fs";
import { CoasterError } from "@baublet/coaster-utils";

export function fileExists(
  fileFullPath: string
): Promise<boolean | CoasterError> {
  return new Promise((resolve) => {
    fs.stat(fileFullPath, function existsSyncStatCallback(err) {
      if (err == null) {
        return resolve(true);
      } else if (err.code === "ENOENT") {
        return resolve(false);
      } else {
        resolve({
          code: "existsSync",
          message: "Unexpected error accessing filesystem: " + err.message,
        });
      }
    });
  });
}
