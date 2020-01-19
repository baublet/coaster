import {
  ModelFactory,
  Model,
  ModelOptionsComputedProps,
  ModelDataDefaultType
} from "./createModel";
import { NormalizedHooksMap } from "./hooks/hooks";
import { GeneratedNames } from "helpers/generateNames";
import { Validator } from "./validate/validate";
import { ModelRelationships } from "./buildRelationships";
import noPersistAdapterError from "./error/noPersistAdapterError";
import validate from "./validate";
import proxyModel from "./proxyModel";
import { PersistConnection, queryFactory } from "persist";

export interface CreateFactoryArguments<T> {
  computedProps: ModelOptionsComputedProps<T>;
  databaseName?: string;
  has: (ModelFactory | ModelFactory[])[];
  names: GeneratedNames;
  normalizedHooks: NormalizedHooksMap;
  persistWith: PersistConnection;
  relationships: (initialData: ModelDataDefaultType) => ModelRelationships;
  tableName: string;
  validators: Validator<T>[];
}

export default function createFactory<T, C>({
  computedProps,
  databaseName,
  has,
  names,
  normalizedHooks,
  persistWith,
  relationships,
  tableName,
  validators
}: CreateFactoryArguments<T>): ModelFactory<T & C> {
  const factory = (initialValue: T = {} as T): Model<T> => {
    normalizedHooks.beforeCreate.forEach(hook =>
      hook({ initialData: initialValue })
    );
    const baseModel = {
      $changed: false,
      $computed: computedProps,
      $data: initialValue,
      $deleted: false,
      $factory: factory,
      $hooks: normalizedHooks,
      $names: names,
      $relationships: relationships(initialValue),
      $validate: validate,
      $validators: validators,
      reload: async () => {
        throw noPersistAdapterError(names.canonical);
      },
      save: async () => {
        throw noPersistAdapterError(names.canonical);
      },
      delete: async () => {
        throw noPersistAdapterError(names.canonical);
      }
    };
    const model = proxyModel(baseModel) as Model<T & C>;
    normalizedHooks.afterCreate.forEach(hook => {
      hook({ model });
    });
    return model;
  };

  factory.databaseName = databaseName;
  factory.isFactory = true;
  factory.names = names;
  factory.tableName = tableName;
  factory.relationships = has;
  if (persistWith) {
    factory.query = queryFactory<T>(persistWith, factory);
  }

  return factory as ModelFactory<T & C>;
}
