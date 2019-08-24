import { Model } from "../../model/createModel";

let id = 1;

function saveModel(memoryMap: Record<string, Model>, model: Model) {
  model.data.id = model.data.id || `model-${id++}`;
  memoryMap[model.data.id] = model;
  return true;
}

export default function saveToMemory(memoryMap: Record<string, Model>) {
  return function(model: Model | Model[]) {
    if (Array.isArray(model)) {
      return model.map(model => saveModel(memoryMap, model));
    }
    return saveModel(memoryMap, model);
  };
}
