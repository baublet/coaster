import { Model } from "model/types";
import { PersistedModel } from "persist/types";
export { validateFactory, ValidationErrors } from "./validate";

export type ModelFieldValidator = (
  fieldValue: any,
  model: Model | PersistedModel
) => false | string[];
