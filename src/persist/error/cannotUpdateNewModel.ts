import { ModelInternalProperties, Model } from "model/types";

export function cannotUpdateNewModel(model: Model) {
  const modelName = ((model as unknown) as ModelInternalProperties).$factory
    .name;
  return new Error(
    `We cannot update model ${modelName} without an ID. Update is for altering existing models only. Did we mean to run ${modelName}.create()?`
  );
}
