import { Model } from "model/createModel";

export default function reloadInvariantViolation(originalModel: Model) {
  return `Reload invariant violation when trying to reload model ${originalModel.$factory.modelName} with ID ${originalModel.id}. It was likely deleted in another part of your application.`
}