import { Model } from "../../model/createModel";

export default function deleteFromMemory(memoryMap: Record<string, Model>) {
  return function(model: Model) {
    const key = model.data.id;
    if (memoryMap[key]) {
      delete memoryMap[key];
      return true;
    }
    return false;
  };
}
