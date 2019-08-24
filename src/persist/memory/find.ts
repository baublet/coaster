import { Model, ModelFactory } from "../../model/createModel";
import { MemoryMap } from "./memory";

function findModel(memoryMap: MemoryMap, modelName: string, id: string): Model {
  if (memoryMap[modelName][id]) {
    return memoryMap[modelName][id];
  }
  return null;
}

export default function findFromMemory(memoryMap: MemoryMap = {}) {
  return async function(
    modelFactory: ModelFactory,
    id: string | string[],
    raw: boolean = false
  ): Promise<Model[] | null> {
    const modelName = modelFactory.modelName;
    id = Array.isArray(id) ? id : [id];
    const results = id.map(id => findModel(memoryMap, modelName, id));
    return raw ? results : results.map(data => modelFactory(data));
  };
}
