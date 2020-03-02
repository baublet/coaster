import { assignRelationships } from "./assignRelationships";
import {
  ModelArgs,
  Model,
  ModelFactory,
  ModelFactoryArgsFromModelArgs,
  ModelArgsPropertyType,
  ModelInternalProperties
} from "./types";
import clone from "lodash.clonedeep";
import {
  PersistModelArgs,
  PersistedModelFactory,
  isPersistArgs
} from "persist/types";
import { attachPersistToModelFactory } from "persist/attachToModelFactory";
import generateNames from "helpers/generateNames";
import { toJson } from "./toJson";

export function createModel<Args extends PersistModelArgs>(
  opts: Args
): PersistedModelFactory<Args>;
export function createModel<Args extends ModelArgs>(
  opts: Args
): ModelFactory<Args>;
export function createModel<Args extends ModelArgs | PersistModelArgs>(
  opts: Args
): Args extends PersistModelArgs
  ? PersistedModelFactory<Args>
  : ModelFactory<Args> {
  const primitiveProps: string[] = [];
  for (const prop in opts.properties) {
    const propArguments = opts.properties[prop];
    switch (propArguments.type) {
      case ModelArgsPropertyType.RELATIONSHIP:
        break;
      default:
        primitiveProps.push(prop);
    }
  }

  function modelFactory(
    initialValue: ModelFactoryArgsFromModelArgs<Args>
  ): Model<Args> {
    let modelData = clone(initialValue);

    // Before instantiate hooks
    opts.hooks?.beforeInstantiate?.forEach(hook => {
      modelData = Object.assign({}, hook(modelData));
    });

    const regularProps = {};
    const relationshipsProps = {};
    const internalProps: ModelInternalProperties<Args> = {
      $factory: modelFactory,
      $initialValues: initialValue
    };

    for (const prop in opts.properties) {
      const propArguments = opts.properties[prop];
      switch (propArguments.type) {
        case ModelArgsPropertyType.RELATIONSHIP:
          relationshipsProps[prop] = assignRelationships(
            propArguments,
            modelData[prop]
          );
          break;
        default:
          regularProps[prop] = modelData[prop];
      }
    }

    const model: Model<Args> = Object.assign(
      regularProps,
      relationshipsProps,
      internalProps
    ) as any;

    // After instantiate hooks
    opts.hooks?.afterInstantiate?.forEach(hook => {
      hook(modelData);
    });

    return model;
  }

  modelFactory.$id = Symbol(opts.name);
  modelFactory.$name = opts.name;
  modelFactory.$options = opts;
  modelFactory.$names = generateNames(opts.name);
  modelFactory.$data = (model: Model<Args>): Record<string, any> => {
    const data: Record<string, any> = {};
    primitiveProps.forEach(prop => (data[prop] = model[prop]));
    return data;
  };
  modelFactory.clone = (model: Model<Args>) =>
    modelFactory(modelFactory.$data(model) as any);
  modelFactory.toJson = toJson;

  if (!isPersistArgs(opts)) {
    return modelFactory as any;
  }

  return attachPersistToModelFactory(modelFactory, opts) as any;
}

// Test pad

const Todo = createModel({
  name: "Todo",
  properties: {
    name: {
      type: ModelArgsPropertyType.STRING
    }
  }
});

const User = createModel({
  name: "User",
  properties: {
    name: {
      type: ModelArgsPropertyType.STRING
    },
    todos: {
      type: ModelArgsPropertyType.RELATIONSHIP,
      modelFactory: Todo,
      many: true
    },
    mainTodo: {
      type: ModelArgsPropertyType.RELATIONSHIP,
      modelFactory: Todo
    }
  }
});

const me = User({ name: "Ryan" });
me;
