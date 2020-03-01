import { Model } from "model/types";

export function cannotDeleteUncreatedModel(model: Model) {
  const modelName = model.$factory.name;
  return new Error(
    `We cannot delete model ${modelName} without an ID. Delete is for deleting existing models only. Did we forget to select the ID field?`
  );
}
