import { attachPersistToModelFactory } from "persist/attachToModelFactory";
import { GeneratedNames } from "helpers/generateNames";
import {
  ModelFactory,
  Model,
  ModelOptionsComputedProps,
  ModelDataDefaultType,
  ModelFactoryWithPersist
} from "./types";
import { ModelRelationships } from "./buildRelationships";
import { NormalizedHooksMap } from "./hooks/hooks";
import { PersistConnection } from "persist/types";
import { Validator } from "./validate/validate";
import proxyModel from "./proxyModel";
import validate from "./validate";

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
  factory.tableName = tableName;

  return attachPersistToModelFactory<T, C>(factory, persistWith);
}
