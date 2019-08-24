import uniqueArrayElements from "./uniqueArrayElements";
import { Model } from "../model/createModel";

export default function(models: Model[]): Model[] {
  return uniqueArrayElements(
    models,
    (model1, model2) => model1.data.id === model2.data.id
  );
}
