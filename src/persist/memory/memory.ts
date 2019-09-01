import deleteFromMemory from "./deleteBy";
import findByFromMemory from "./findBy";
import saveToMemory from "./save";
import { PersistAdapter } from "persist";

export type MemoryMap = Record<string, Record<string, any>>;

const memoryMap: MemoryMap = {};

export default function persistInMemory(initialMemoryMap: MemoryMap = {}): PersistAdapter {
  Object.assign(memoryMap, initialMemoryMap);
  return {
    deleteBy: deleteFromMemory(memoryMap),
    findBy: findByFromMemory(memoryMap),
    save: saveToMemory(memoryMap)
  };
}
