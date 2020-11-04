import { CreateModelArguments, NullableKeys } from "./types";

export function nullableKeys<T extends CreateModelArguments>(
  def: T
): NullableKeys<T["properties"]>[] {
  const nullableKeys: NullableKeys<T["properties"]>[] = [];

  for (const [key, typeDef] of Object.entries(def.properties)) {
    if (typeDef.nullable) {
      nullableKeys.push(key as NullableKeys<T["properties"]>);
    }
  }

  return nullableKeys;
}
