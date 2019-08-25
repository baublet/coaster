import { PersistFindByProps } from "../..";
import { Model, ModelDataDefaultType } from "../../../model/createModel";
import findResultsForLogicalMatcher from "./findResultsForLogicalMatcher";
import { MemoryMap } from "../memory";

export default function findBy(memoryMap: MemoryMap = {}) {
  return async function({
    query,
    sort = [],
    limit = 0,
    offset = 0,
    raw = false,
    eager = true
  }: PersistFindByProps): Promise<ModelDataDefaultType[] | Model[]> {
    // First, find the results
    const results = findResultsForLogicalMatcher(memoryMap, query);
    // Then sort stuff
    // Then trim $offset at the beginning
    // Then limit things
    // Finished!
    const modelFactory = query.$model;
    return raw ? results : results.map(modelData => {
      if(!query.$merge) {
        return modelFactory(modelData)
      }

      const fullyInstantiated = modelFactory(modelData);
      // TODO: instantiate merged fields as models
    });
  };
}
