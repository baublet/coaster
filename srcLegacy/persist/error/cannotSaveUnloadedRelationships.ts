import { PersistedModel } from "persist/types";

export default function cannoSaveUnloadedRelationships(model: PersistedModel) {
  return new Error(
    `We tried to save the relationships for ${model.$factory.$name} without first loading them. This could lead to unexpected data loss.`
  );
}
