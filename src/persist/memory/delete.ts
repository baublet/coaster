import { Model, ModelFactory } from "../../model/createModel";
import { MemoryMap } from "./memory";

export default function deleteFromMemory(memoryMap: MemoryMap) {
  return async function(
    model: Model | string,
    modelFactory?: ModelFactory
  ): Promise<boolean> {
    if (typeof model === "string" && !modelFactory) {
      throw `You cannot delete a model by ID ${model} without passing in the ModelFactory.`;
    }
    const key = typeof model === "string" ? model : model.data.id;
    const modelName =
      typeof model === "string" ? modelFactory.modelName : model.name;
    if (memoryMap[modelName][key]) {
      delete memoryMap[modelName][key];
      return true;
    }
    return false;
  };
}
