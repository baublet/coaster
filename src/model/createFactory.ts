import attachPersistFunctionsToModel from "./attachPersistFunctionsToModel";
import { ModelFactory, Model, ModelOptionsComputedProps } from "./createModel";
import { NormalizedHooksMap } from "./hooks/hooks";
import { GeneratedNames } from "helpers/generateNames";
import { Validator } from "./validate/validate";
import { ModelRelationships } from "./buildRelationships";
import noPersistAdapterError from "./error/noPersistAdapterError";
import validate from "./validate";
import { PersistAdapter } from "persist";
import proxyModel from "./proxyModel";
import { Schema } from "persist/schema";
import get from "lodash.get";

export interface CreateFactoryArguments<T, C> {
  computedProps: ModelOptionsComputedProps<T>;
  databaseName?: string;
  names: GeneratedNames;
  normalizedHooks: NormalizedHooksMap;
  persistWith?: PersistAdapter;
  relationships: ModelRelationships;
  schema: Schema | null;
  tableName: string;
  validators: Validator<T>[];
}

export default function createFactory<T, C>({
  computedProps,
  databaseName,
  names,
  normalizedHooks,
  persistWith,
  relationships,
  schema,
  tableName,
  validators
}: CreateFactoryArguments<T, C>): ModelFactory<T & C> {
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
      $relationships: relationships,
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
    if (persistWith) {
      attachPersistFunctionsToModel(baseModel, persistWith);
    }
    const model = proxyModel(baseModel) as Model<T & C>;
    normalizedHooks.afterCreate.forEach(hook => {
      hook({ model });
    });
    return model;
  };

  let database: string = databaseName;
  if (!databaseName) {
    if (persistWith) {
      database = get(persistWith, "defaultDatabase", "default");
    } else {
      database = "default";
    }
  }

  factory.databaseName = database;
  factory.isFactory = true;
  factory.names = names;
  factory.schema = schema;
  factory.tableName = tableName;
  return factory as ModelFactory<T, C>;
}
