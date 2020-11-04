import { SchemaNodeWithManyToMany } from "./schema";
import { generateNames } from "helpers/generateNames";

export function addRelationalManyToManyModelMethods(
  node: SchemaNodeWithManyToMany
): string {
  const names = generateNames(node.of);
  const normalizedModelName = `Normalized${names.canonical}`;
  const helpfulArgumentName = names.camel;
  const helpfulArgumentNamePlural = names.camelPlural;

  return `{
    add(${helpfulArgumentName}: ${node.of} | ${normalizedModelName}): Promise<void>;
    clear(): Promise<void>;
    remove(${helpfulArgumentName}:${node.of} | ${normalizedModelName}): Promise<void>;
    set(${helpfulArgumentNamePlural}: (${node.of} | ${normalizedModelName})[]): Promise<void>;
  }`;
}
