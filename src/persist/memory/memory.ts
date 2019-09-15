import deleteFromMemory from "./deleteBy";
import findByFromMemory from "./findBy";
import saveToMemory from "./save";
import { PersistAdapter } from "persist";
import { Schema } from "persist/schema";

export type MemoryMap = Record<string, Record<string, any>>;

const memoryMap: MemoryMap = {};

export default function persistInMemory(
  initialMemoryMap: MemoryMap = {},
  schema: Schema | null = null,
  defaultDatabase: string = "MemoryDatabase"
): PersistAdapter {
  Object.assign(memoryMap, initialMemoryMap);
  return {
    schema,
    defaultDatabase,
    deleteBy: deleteFromMemory(memoryMap),
    findBy: findByFromMemory(memoryMap),
    save: saveToMemory(memoryMap)
  };
}
