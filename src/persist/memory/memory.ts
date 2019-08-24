import deleteFromMemory from "./delete";
import findFromMemory from "./find";
import findByFromMemory from "./findBy";
import saveToMemory from "./save";

const memoryMap = {};

export default function persistInMemory() {
  return {
    delete: deleteFromMemory(memoryMap),
    find: findFromMemory(memoryMap),
    findBy: findByFromMemory(memoryMap),
    save: saveToMemory(memoryMap)
  };
}
