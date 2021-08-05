import { MetaData } from "..";

export function assertHasRawTypeMap(
  metaData: MetaData
): asserts metaData is MetaData & { types: Map<string, string> } {
  if (typeof metaData.types === "object") {
    if (typeof metaData.types.clear === "function") {
      return;
    }
  }
  throw new Error(
    `Error: MetaData has no raw type map attached to it. Did you forget to add "rawTypes" to your generators list?`
  );
}
