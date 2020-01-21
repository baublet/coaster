import {
  ModelFactory,
  Model,
  ModelOptionsComputedProps,
  ModelDataDefaultType,
  ModelFactoryWithPersist
} from "./createModel";
import { NormalizedHooksMap } from "./hooks/hooks";
import { GeneratedNames } from "helpers/generateNames";
import { Validator } from "./validate/validate";
import { ModelRelationships } from "./buildRelationships";
import validate from "./validate";
import proxyModel from "./proxyModel";
import { PersistConnection, queryFactory } from "persist";

export interface CreateFactoryArguments<T> {
  computedProps: ModelOptionsComputedProps<T>;
  databaseName?: string;
  has: (ModelFactory | ModelFactory[])[];
  names: GeneratedNames;
  normalizedHooks: NormalizedHooksMap;
  persistWith?: PersistConnection;
  relationships: (initialData: ModelDataDefaultType) => ModelRelationships;
  tableName?: string;
  validators: Validator<T>[];
}

export function createFactory<T, C>({
  computedProps,
  databaseName,
  has,
  names,
  normalizedHooks,
  persistWith,
  relationships,
  tableName,
  validators
}: CreateFactoryArguments<T>):
  | ModelFactoryWithPersist<T, C>
  | ModelFactory<T, C> {
  const factory = (initialValue: T): Model<T & C> => {
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
      $validators: validators
    };
    const model = proxyModel(baseModel) as Model<T & C>;
    normalizedHooks.afterCreate.forEach(hook => {
      hook({ model });
    });
    return model;
  };

  factory.isFactory = true;
  factory.names = names;
  factory.relationships = has;

  if (!persistWith) {
    return factory;
  }

  factory.databaseName = databaseName;
  factory.query = queryFactory<T>(persistWith, factory);
  factory.tableName = tableName;

  return factory;
}
