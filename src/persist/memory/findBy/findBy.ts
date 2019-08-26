import { PersistFindByProps, PersistMatcherType } from "../..";
import {
  Model,
  ModelDataDefaultType,
  ModelFactory
} from "../../../model/createModel";
import findResultsForLogicalMatcher from "./findResultsForLogicalMatcher";
import { MemoryMap } from "../memory";
import uniqueArrayElements from "../../../helpers/uniqueArrayElements";
import { SchemaNodeType } from "../../../model/schema";

export default function findByFactory(memoryMap: MemoryMap = {}) {
  return async function findBy({
    query,
    raw = false,
    eager = true
  }: PersistFindByProps): Promise<ModelDataDefaultType[] | Model[]> {
    // First, find the results
    const results = findResultsForLogicalMatcher(memoryMap, query);
    // Then sort stuff
    // Then trim $offset at the beginning
    // Then limit things
    // Finished!

    if (raw) return results;

    // Instantiate the new models
    const modelFactory = query.$model;
    if (eager === false) return results.map(result => modelFactory(result));

    // Eager load all additional related models
    const idMap: Array<[ModelFactory, number[]]> = [];
    Object.values(modelFactory.schema).forEach(node => {
      if (node.type === SchemaNodeType.MODEL) {
        const nodeLocalId = `${node.names.safe}_id`;
        const ids: (null | number)[] = uniqueArrayElements(
          results
            .map(result => {
              if (result[nodeLocalId]) return result[nodeLocalId];
              return null;
            })
            .filter(id => id !== null)
        );
        idMap.push([modelFactory, ids]);
      }
    });
    const relatedModels: Map<ModelFactory, Record<number, Model>> = new Map();
    // For each model relation, load the models by their ids
    await Promise.all(
      idMap.map(async ([modelFactory, ids]) => {
        const results = await findBy({
          query: {
            $model: modelFactory,
            id: [PersistMatcherType.ONE_OF, [ids]]
          }
        });
        const resultsMap = {};
        results.forEach(result => {
          resultsMap[result.id] = result;
        })
        relatedModels.set(modelFactory, resultsMap);
      })
    );
    // Now, we've loaded all related models in an in-memory store. Let's
    // attach them to the underlying models
    return results.map(result => {
      return modelFactory(result);
    })
  };
}
