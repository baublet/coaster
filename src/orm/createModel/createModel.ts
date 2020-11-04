import { nullableKeys } from "../nullableKeys";
import {
  CreateModelArguments,
  ModelDetails,
  ModelPrimitiveTypes,
  ModelPropertyDefinitionPrimitive,
  ModelPropertyType,
  NullableKeys,
} from "../types";
import { createFn } from "./createFn";
import { deleteFn } from "./deleteFn";
import { findFn } from "./findFn";
import { saveFn } from "./saveFn";

export function prop<T extends ModelPropertyType>(
  type: T
): ModelPropertyDefinitionPrimitive<T> {
  return {
    type,
    nullable: false,
  };
}

export function nullable<T extends ModelPropertyType>(
  type: T
): ModelPropertyDefinitionPrimitive<T, true> {
  return {
    type,
    nullable: true,
  };
}

export function createModel<T extends CreateModelArguments>(
  def: T
): ModelDetails<T> {
  const model: Partial<ModelDetails<T>> = {};

  model.$modelPrimitiveTypes = {} as ModelPrimitiveTypes<T>;
  model.$nullableKeys = nullableKeys(def);
  model.$nullableKeyType = "" as NullableKeys<T["properties"]>;
  model.$originalArguments = def;
  model.$validators = [];

  model.create = createFn(def);
  model.delete = deleteFn(def);
  model.find = findFn(def);
  model.save = saveFn(def, model as ModelDetails<T>);

  model.withValidator = (validator) => {
    model.$validators.push(validator);
    return model as ModelDetails<T>;
  };

  model.validate = async (m) => {
    const validators = model.$validators.map((v) => v(m));
    const settled = await Promise.all(validators);
    const errors: string[] = [];
    let valid = true;
    for (const [success, error] of settled) {
      if (!success) {
        valid = false;
      }
      if (error) {
        errors.push(error);
      }
    }
    if (valid) {
      return true;
    }
    return errors;
  };

  return model as ModelDetails<T>;
}
