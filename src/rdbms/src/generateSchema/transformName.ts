import { camelCase, pascalCase } from "change-case";

import { NameTransformer } from "../types";

export function transformName({
  name,
  transformer,
  defaultTransformer,
}: {
  name: string;
  transformer?: NameTransformer;
  defaultTransformer: "camelCase" | "pascalCase";
}): string {
  if (transformer) {
    return transformer(name);
  }

  if (defaultTransformer === "camelCase") {
    return camelCase(name);
  } else {
    return pascalCase(name);
  }
}
