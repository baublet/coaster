import { Model, ModelInternalProperties } from "model/types";

export function cannotCreateExistingModel(model: Model) {
  const modelName = (model as ModelInternalProperties).$factory.name;
  throw new Error(
    `We cannot create model ${modelName}. It already has an ID, and thus already exists. Create is for saving new models only. Did you mean to run ${modelName}.update()? If you need to duplicate a model, use ${modelName}.duplicate().`
  );
}
