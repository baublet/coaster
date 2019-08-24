import { Model } from "../../model/createModel";
import { MemoryMap } from "./memory";

let id = 1;

function saveModel(memoryMap: MemoryMap, model: Model) {
  model.data.id = model.data.id || `model-${id++}`;
  memoryMap[model.name] = memoryMap[model.name] || {};
  memoryMap[model.name][model.data.id] = model.data;
  return true;
}

export default function saveToMemory(memoryMap: MemoryMap) {
  return async function(model: Model | Model[]): Promise<boolean | boolean[]> {
    if (Array.isArray(model)) {
      return model.map(model => saveModel(memoryMap, model));
    }
    return saveModel(memoryMap, model);
  };
}
