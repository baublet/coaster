import { camelCase } from "change-case";

import { NameTransformer } from "../types";

export function transformName(
  name: string,
  transformer?: NameTransformer
): string {
  if (transformer) {
    return transformer(name);
  }
  return camelCase(name);
}
