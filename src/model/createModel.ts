import { NormalizedHooksMap } from "./hooks/hooks";
import buildRelationships from "./buildRelationships";
import composeModel from "./composers";
import generateNames from "helpers/generateNames";
import normalizeHooks from "./hooks";
import { createFactory } from "./createFactory";
import {
  ModelFactory,
  ModelOptions,
  ModelFactoryWithPersist,
  isModelOptionsWithPersist,
  ModelOptionsWithPersist
} from "./types";

/**
 * Sugar around declaring a simple hasMany relationship via
 * `has: [many(Todos)]` instead of the clunky `has: [[Todos]]`
 * @param factory
 */
export function many<T extends ModelFactory>(factory: T): [T] {
  return [factory];
}

export function createModel<T = {}>(args: ModelOptions<T>): ModelFactory<T>;
export function createModel<T = {}>(
  args: ModelOptionsWithPersist<T>
): ModelFactoryWithPersist<T>;
export function createModel<T = {}>(
  args: ModelOptions<T>
): ModelFactory<T> | ModelFactoryWithPersist<T> {
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
  let primaryKey = "id";
  let tableName;
  let databaseName;
  if (isModelOptionsWithPersist<T>(args)) {
    databaseName = args.databaseName || "default";
    tableName = args.tableName || names.pluralSafe;
    persistWith = args.persistWith;
    primaryKey = args.primaryKey || primaryKey;
  }

  // Build our factory
  return createFactory<T>({
    computedProps,
    databaseName,
    has,
    names,
    normalizedHooks,
    persistWith,
    primaryKey,
    relationships,
    tableName,
    validators
  });
}
