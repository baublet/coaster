import { Model } from "../../model/createModel";
import { MemoryMap } from "./memory";

let id = 1;

function saveModel(memoryMap: MemoryMap, model: Model): true {
  model.data.id = model.data.id || `model-${id++}`;
  const databaseName = model.$factory.$databaseName;
  const tableName = model.$factory.$tableName;

  if (!memoryMap[databaseName]) memoryMap[databaseName] = {};
  if (!memoryMap[databaseName][tableName])
    memoryMap[databaseName][tableName] = {};

  memoryMap[databaseName][tableName] = memoryMap[databaseName][tableName] || {};
  memoryMap[databaseName][tableName][model.data.id] = model.data;
  return true;
}

export default function saveToMemory(memoryMap: MemoryMap) {
  return async function(
    model: Model | Model[]
  ): Promise<boolean | string | boolean[] | string[]> {
    if (Array.isArray(model)) {
      return model.map(model => saveModel(memoryMap, model));
    }
    return saveModel(memoryMap, model);
  };
}
