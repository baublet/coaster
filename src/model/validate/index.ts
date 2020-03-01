import { Model } from "../types";

export type ModelFieldValidator = (
  fieldValue: any,
  model: Model
) => false | string[];
