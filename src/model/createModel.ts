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
  function modelFactory(
    initialValue: ModelFactoryArgsFromModelArgs<Args>
  ): Model<Args> {
    const modelData = clone(initialValue);

    const regularProps = {};
    const computedProps = {};
    const relationshipsProps = {};
    const internalProps: ModelInternalProperties<Args> = {
      $factory: modelFactory,
      $baseValues: initialValue
    };

    for (const prop in opts.properties) {
      const propArguments = opts.properties[prop];
      switch (propArguments.type) {
        case ModelArgsPropertyType.COMPUTED:
          computedProps[prop] = () => {
            // Copy the data so computed props can't modify props directly
            const newProps = clone(modelData);
            return propArguments.compute(newProps);
          };
          break;
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

    return Object.assign(
      {},
      regularProps,
      computedProps,
      relationshipsProps,
      internalProps
    );
  }

  modelFactory.$id = Symbol(opts.name);
  modelFactory.$name = opts.name;
  modelFactory.$options = opts;
  modelFactory.$names = generateNames(opts.name);

  if (!isPersistArgs(opts)) {
    opts;
    return modelFactory as any;
  }

  attachPersistToModelFactory(modelFactory);

  return modelFactory as any;
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
