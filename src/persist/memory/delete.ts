import { Model } from "../../model/createModel";

export default function deleteFromMemory(memoryMap: Record<string, Model>) {
  return async function(model: Model | string): Promise<boolean> {
    const key = typeof model === "string" ? model : model.data.id;
    if (memoryMap[key]) {
      delete memoryMap[key];
      return true;
    }
    return false;
  };
}
