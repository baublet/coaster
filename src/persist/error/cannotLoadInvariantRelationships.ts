import { Model } from "model/types";

export default function cannotLoadInvariantRelationships(modelArray: Model[]) {
  return new Error(
    `We can't call \`loadRelationships\` with an array containing different types of models types. They must all be the same model type in order to efficiently load relationships. The array we passed in had the following model types: ${modelArray
      .map(model => model.$factory.name)
      .join(", ")}.`
  );
}
