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

export function createModel<Args extends ModelArgs>(
  opts: Args
): ModelFactory<Args> {
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

  return modelFactory;
}
