import { ModelFactory, ModelDataDefaultType, isModel } from "./types";
import proxyModelArray from "./proxyModelArray";

export type ModelRelationships = Record<string, ModelFactory[]>;

export default function buildRelationships(
  has: (ModelFactory | ModelFactory[])[],
  initialData: ModelDataDefaultType
): ModelRelationships {
  const relationships = {};
  has.forEach((has: ModelFactory | [ModelFactory]) => {
    let name: string;
    let factory: ModelFactory;
    if (Array.isArray(has)) {
      name = has[0].names.pluralSafe;
      factory = has[0];
    } else {
      name = has.names.safe;
      factory = has;
    }
    // Initialize the relationship with data. If the user passes in models,
    // sweet. We just use those. If it's data, we try to initialize a model.
    const initial = Array.isArray(initialData[name])
      ? initialData[name].map(data => {
          if (isModel(data)) return data;
          return factory(data);
        })
      : [];
    relationships[name] = Array.isArray(has) ? proxyModelArray(initial) : null;
  });
  return relationships;
}
