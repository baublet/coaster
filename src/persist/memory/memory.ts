import deleteMemory from "./delete";

const memoryMap = {};

export default function persistInMemory() {
  return {
    delete: deleteMemory(memoryMap)
  }
}