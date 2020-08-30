import { SchemaNodeWithManyToMany } from "./schema";
import { generateNames } from "helpers/generateNames";

export function addRelationalManyToManyModelMethods(
  node: SchemaNodeWithManyToMany
): string {
  const names = generateNames(node.of);
  const normalizedModelName = `Normalized${names.canonical}`;

  return `{
  add(${node.of} | ${normalizedModelName}): Promise<void>;
  clear(): Promise<void>;
  remove(${node.of} | ${normalizedModelName}): Promise<void>;
  set((${node.of} | ${normalizedModelName})[]): Promise<void>;
}`;
}
