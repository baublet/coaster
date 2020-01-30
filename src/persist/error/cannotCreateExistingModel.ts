import { Model, ModelInternalProperties } from "model/types";

export function cannotCreateExistingModel(model: Model) {
  const modelName = ((model as unknown) as ModelInternalProperties).$factory
    .name;
  return new Error(
    `We cannot create model ${modelName}. It already has an ID, and thus already exists. Create is for saving new models only. Did we mean to run ${modelName}.update()? If we need to duplicate a model, use ${modelName}.duplicate().`
  );
}
