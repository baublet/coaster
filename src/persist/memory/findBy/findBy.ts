import { PersistFindByProps } from "../..";
import { Model } from "../../../model/createModel";
import findResultsForLogicalMatcher from "./findResultsForLogicalMatcher";

export default function findBy(memoryMap: Record<string, Model> = {}) {
  return async function({
    query,
    sort = [],
    limit = 0,
    offset = 0
  }: PersistFindByProps): Promise<Model[]> {
    // First, find the results
    const results = findResultsForLogicalMatcher(
      Object.values(memoryMap),
      query
    );
    // Then sort stuff
    // Then trim $offset at the beginning
    // Then limit things
    // Finished!
    return results;
  };
}
