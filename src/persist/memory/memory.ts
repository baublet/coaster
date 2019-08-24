import deleteFromMemory from "./delete";
import findFromMemory from "./find";
import findByFromMemory from "./findBy";
import saveToMemory from "./save";
import { Model } from "../../model/createModel";

export type MemoryMap = Record<string, Record<string, any>>

const memoryMap: MemoryMap = {};

export default function persistInMemory() {
  return {
    delete: deleteFromMemory(memoryMap),
    find: findFromMemory(memoryMap),
    findBy: findByFromMemory(memoryMap),
    save: saveToMemory(memoryMap)
  };
}
