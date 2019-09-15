import { MemoryMap } from "./memory";
import findResultsFromLogicalMatcher from "./findResultsForLogicalMatcher";
import { PersistDeleteQuery } from "..";

export default function deleteBy(memoryMap: MemoryMap) {
  return async function(query: PersistDeleteQuery): Promise<number> {
    const results = findResultsFromLogicalMatcher(memoryMap, query);

    if (!results) {
      return 0;
    }

    const databaseName = query.$model.databaseName;
    const tableName = query.$model.tableName;

    if (!memoryMap[databaseName]) {
      memoryMap[databaseName] = {};
      return 0;
    }

    if (!memoryMap[databaseName][tableName]) {
      memoryMap[databaseName][tableName] = {};
      return 0;
    }

    for (let i = 0; i < results.length; i++) {
      const id = results[i].id;
      delete memoryMap[databaseName][tableName][id];
    }
    return results.length;
  };
}
