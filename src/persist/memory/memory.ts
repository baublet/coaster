import deleteFromMemory from "./deleteBy";
import findByFromMemory from "./findBy";
import saveToMemory from "./save";

export type MemoryMap = Record<string, Record<string, any>>;

const memoryMap: MemoryMap = {};

export default function persistInMemory() {
  return {
    deleteBy: deleteFromMemory(memoryMap),
    findBy: findByFromMemory(memoryMap),
    save: saveToMemory(memoryMap)
  };
}
