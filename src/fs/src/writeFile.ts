import fs from "fs";
import path from "path";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

export function writeFile(
  fullPath: string,
  contents: any
): Promise<undefined | CoasterError> {
  const resolvedPath = path.resolve(fullPath);
  return new Promise((resolve) => {
    fs.writeFile(resolvedPath, contents, (error) => {
      if (error) {
        resolve(
          createCoasterError({
            code: "writeFile",
            message: `Unexpected error reading file: ${resolvedPath}`,
            details: {
              fullPath,
              resolvedPath,
            },
            error,
          })
        );
      } else {
        resolve(undefined);
      }
    });
  });
}
