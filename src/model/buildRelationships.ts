import { ModelFactory } from "./createModel";
import proxyModelArray from "./proxyModelArray";

export type ModelRelationships = Record<string, ModelFactory[]>;

export default function buildRelationships(
  has: (ModelFactory | ModelFactory[])[]
): ModelRelationships {
  const relationships = {};
  has.forEach((has: ModelFactory | [ModelFactory]) => {
    let name: string;
    if (Array.isArray(has)) {
      name = has[0].names.pluralSafe;
    } else {
      name = has.names.safe;
    }
    relationships[name] = Array.isArray(has) ? proxyModelArray([]) : null;
  });
  return relationships;
}
