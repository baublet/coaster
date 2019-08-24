import { Model } from "../../model/createModel";

function findModel(memoryMap: Record<string, Model>, id: string): Model {
  if (memoryMap[id]) {
    return memoryMap[id];
  }
  return null;
}

export default function findFromMemory(memoryMap: Record<string, Model> = {}) {
  return async function(
    id: string | string[]
  ): Promise<Model | Model[] | null> {
    if (Array.isArray(id)) {
      return id.map(id => findModel(memoryMap, id));
    }
    return findModel(memoryMap, id);
  };
}
