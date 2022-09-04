import { createHash } from "crypto";

export function hashString(stringToHash: string): string {
  return createHash("md5").update(stringToHash).digest("hex");
}
