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

export interface CreateFactoryArguments<T, C> {
  computedProps: ModelOptionsComputedProps<C>;
  names: GeneratedNames;
  normalizedHooks: NormalizedHooksMap;
  persistWith?: PersistAdapter;
  relationships: ModelRelationships;
  validators: Validator<T>[];
}

export default function createFactory<T, C>({
  computedProps,
  names,
  normalizedHooks,
  persistWith,
  relationships,
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
  factory.names = names;
  factory.isFactory = true;
  return factory as ModelFactory<T, C>;
}
