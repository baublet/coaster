import { MemoryMap } from "./memory";
import findResultsFromLogicalMatcher from "./findResultsForLogicalMatcher";
import { PersistDeleteQuery } from "..";

export default function deleteBy(memoryMap: MemoryMap) {
  return async function(query: PersistDeleteQuery): Promise<number> {
    const results = findResultsFromLogicalMatcher(memoryMap, query);
    const modelName = query.$model.modelName;
    for (let i = 0; i < results.length; i++) {
      const id = results[i].id;
      delete memoryMap[modelName][id];
    }
    return results.length;
  };
}
