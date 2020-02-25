import { Model } from "models2/types";

export type ModelFieldValidator = (
  fieldValue: any,
  model: Model
) => false | string[];
