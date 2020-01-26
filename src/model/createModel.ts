import { NormalizedHooksMap } from "./hooks/hooks";
import buildRelationships from "./buildRelationships";
import composeModel from "./composers";
import generateNames from "helpers/generateNames";
import normalizeHooks from "./hooks";
import { createFactory } from "./createFactory";
import {
  ModelFactory,
  ModelDataDefaultType,
  ModelOptions,
  ModelFactoryWithPersist,
  isModelOptionsWithPersist,
  ModelOptionsWithPersist
} from "./types";

export function many(model: ModelFactory): [ModelFactory] {
  return [model];
}

export function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>(
  args: ModelOptions<T, C>
): ModelFactory<T, C>;
export function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>(
  args: ModelOptionsWithPersist<T, C>
): ModelFactoryWithPersist<T, C>;
export function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>(
  args: ModelOptions<T, C> | ModelOptionsWithPersist<T, C>
): any {
  const {
    composers = [],
    computedProps = {},
    has = [],
    hooks = {},
    name,
    validators = []
  } = args;

  const names = generateNames(name);

  // Normalize hook nodes into arrays
  const normalizedHooks: NormalizedHooksMap = normalizeHooks(hooks);

  // Run our composers
  composeModel(names.canonical, composers, computedProps, has, validators);

  // Build out relationships object out of our `has` options
  const relationships = initialValue => buildRelationships(has, initialValue);

  let persistWith;
  let tableName;
  let databaseName;
  if (isModelOptionsWithPersist<T, C>(args)) {
    persistWith = args.persistWith;
    tableName = args.tableName || names.pluralSafe;
    databaseName = args.databaseName || "default";
  }

  // Build our factory
  return createFactory<T, C>({
    computedProps,
    databaseName,
    has,
    names,
    normalizedHooks,
    persistWith,
    relationships,
    tableName,
    validators
  });
}
