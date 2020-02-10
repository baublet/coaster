import { ModelFactoryWithPersist } from "model/types";

export function cannotUpdateWithoutPrimaryKey(
  modelFactory: ModelFactoryWithPersist,
  model: any
) {
  return new Error(
    `We tried to update a the ${
      modelFactory.name
    } database model using an uninstantiated model. This is fine! But we must pass in the model factory's primary key, ${
      modelFactory.primaryKey
    }, to do so, or we don't know which record to update. You tried to update using the following data: ${JSON.stringify(
      model
    )}`
  );
}
