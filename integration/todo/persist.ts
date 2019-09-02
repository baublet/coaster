import persistInMemory from "persist/memory";

export const memoryMap = {};

export default persistInMemory(memoryMap);
