import { PersistFindByProps } from "../..";
import { Model } from "../../../model/createModel";
import findResultsForLogicalMatcher from "./findResultsForLogicalMatcher";
import { MemoryMap } from "../memory";

export default function findBy(memoryMap: MemoryMap = {}) {
  return async function({
    query,
    sort = [],
    limit = 0,
    offset = 0,
    raw = false
  }: PersistFindByProps): Promise<Model[]> {
    // First, find the results
    const results = findResultsForLogicalMatcher(
      memoryMap,
      query
    );
    // Then sort stuff
    // Then trim $offset at the beginning
    // Then limit things
    // Finished!
    return results;
  };
}
