import { ModelInternalProperties, Model } from "model/types";

export function cannotUpdateNewModel(model: Model) {
  const modelName = (model as ModelInternalProperties).$factory.name;
  throw new Error(
    `We cannot update model ${modelName} without an ID. Update is for altering existing models only. Did you mean to run ${modelName}.create()?`
  );
}
