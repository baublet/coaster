import { attachPersistToModelFactory } from "persist/attachToModelFactory";
import { GeneratedNames } from "helpers/generateNames";
import {
  ModelFactory,
  Model,
  ModelOptionsComputedProps,
  ModelDataDefaultType,
  ModelFactoryWithPersist,
  ModelRelationshipArguments,
  ModelDataPropTypes
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
  has: ModelRelationshipArguments;
  names: GeneratedNames;
  normalizedHooks: NormalizedHooksMap;
  persistWith?: PersistConnection;
  primaryKey: string;
  relationships: (initialData: ModelDataDefaultType) => ModelRelationships;
  tableName?: string;
  validators: Validator<T>[];
}

export function createFactory<T extends ModelDataPropTypes>({
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
}: CreateFactoryArguments<T>): ModelFactoryWithPersist<T> | ModelFactory<T> {
  const factory = (initialValue): Model<T> => {
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
      $isModel: true,
      $names: names,
      $relationships: relationships(initialValue),
      $validate: validate,
      $validators: validators,
      toJson: () => ({})
    };
    const model = proxyModel(baseModel) as Model<T>;
    normalizedHooks.afterCreate.forEach(hook => {
      hook({ model });
    });
    return model;
  };

  factory.$id = Symbol(names.canonical);
  factory.isFactory = true;
  factory.names = names;
  factory.relationships = has;

  if (!persistWith) {
    return factory;
  }

  factory.databaseName = databaseName;
  factory.primaryKey = primaryKey;
  factory.tableName = tableName;

  return attachPersistToModelFactory<T>(factory, persistWith);
}
