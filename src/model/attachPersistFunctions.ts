import {
  Model,
  ModelDataDefaultType,
  ModelInternalProperties
} from "./createModel";
import { PersistAdapter } from "../persist";
import reloadInvariantViolation from "./error/reloadInvariantViolation";

export default function attachPersistFunctions(
  model: Model,
  adapter: PersistAdapter
): void {
  const persistFunctions = {
    save: (ignoreValidation: boolean = false) => {
      if (!ignoreValidation) {
        const valid = model.$validate(model.$data, model.$validators);
        if (valid !== true) {
          return valid;
        }
      }
      return adapter.save(model);
    },
    reload: async () => {
      const id = model.$data.id;
      const results = await adapter.findBy({
        query: {
          $model: model.$factory,
          id
        },
        raw: true
      });
      if (!results.length) {
        throw reloadInvariantViolation(model);
      }
      model.$data = results[0];
      return true;
    },
    delete: async () => {
      const deleted = await adapter.deleteBy({
        $model: model.$factory,
        id: model.$data.id
      });
      return Boolean(deleted);
    }
  };

  // Attach them
  Object.assign(model, persistFunctions);
}
