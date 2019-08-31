import { Model, ModelDataDefaultType } from "./createModel";
import { PersistAdapter } from "../persist";
import { ModelValidationErrors } from "./validate/validate";

export type ModelWithPersist<T> = Model<
  T & {
    save: () => true | ModelValidationErrors;
    reload: () => boolean;
    delete: () => boolean;
  }
>;

export default function modelWithPersist<T = ModelDataDefaultType>(
  model: Model<T & ModelDataDefaultType>,
  adapter: PersistAdapter
): ModelWithPersist<T> {
  return {
    ...model,
    save: (ignoreValidation: boolean = false) => {
      if (!ignoreValidation) {
        const valid = model.$validate(model.$data, model.$validators);
        if (valid !== true) {
          return valid;
        }
      }
      return adapter.save(model);
    },
    reload: () => {
      return true;
    },
    delete: () =>
      adapter.deleteBy({
        query: {
          $model: model.$factory,
          id: model.id
        }
      })
  } as ModelWithPersist<T>;
}
