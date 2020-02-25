import {
  ModelFactory,
  ModelDataDefaultType,
  ModelRelationshipArguments,
  isModel,
  isModelHasArguments
} from "./types";
import proxyModelArray from "./proxyModelArray";

export type ModelRelationships = Record<string, ModelFactory[]>;

export default function buildRelationships(
  has: ModelRelationshipArguments,
  initialData: ModelDataDefaultType
): ModelRelationships {
  const relationships = {};
  has.forEach(has => {
    let name: string;
    let factory: ModelFactory;
    if (isModelHasArguments(has)) {
      factory = has.model;
      if (has.accessName === undefined) {
        name = has.many ? has.model.names.pluralSafe : has.model.names.safe;
      }
    } else if (Array.isArray(has)) {
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

    const isMultiple =
      Array.isArray(has) || (isModelHasArguments(has) && has.many);
    relationships[name] = isMultiple ? proxyModelArray(initial) : null;
  });
  return relationships;
}
