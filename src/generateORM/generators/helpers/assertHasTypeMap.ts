import { MetaData } from "..";

export function assertHasTypeMap(
  metaData: MetaData
): asserts metaData is MetaData & { types: Map<string, string> } {
  if (typeof metaData.types === "object") {
    if (typeof metaData.types.clear === "function") {
      return;
    }
  }
  throw new Error(
    `Error: MetaData has no type map attached to it. Did you forget to add "types" to your generators list?`
  );
}
