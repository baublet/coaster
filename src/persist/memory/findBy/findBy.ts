import { PersistFindByProps, PersistMatcherType } from "../..";
import {
  Model,
  ModelDataDefaultType,
  ModelFactory
} from "../../../model/createModel";
import findResultsForLogicalMatcher from "../findResultsForLogicalMatcher";
import { MemoryMap } from "../memory";
import uniqueArrayElements from "../../../helpers/uniqueArrayElements";
import { SchemaNodeType } from "../../../model/schema";

export default function findByFactory(memoryMap: MemoryMap = {}) {
  return async function findBy({
    query,
    raw = false,
    eager = false
  }: PersistFindByProps): Promise<ModelDataDefaultType[] | Model[]> {
    // First, find the results
    const results = findResultsForLogicalMatcher(memoryMap, query);
    // Then sort stuff
    // Then trim $offset at the beginning
    // Then limit things
    // Finished!

    if (raw) {
      return results;
    }

    // Instantiate the new models
    const modelFactory = query.$model;
    if (eager === false) return results.map(result => modelFactory(result));

    // Eager load all additional related models
    interface IDMapForModelRelations {
      factory: ModelFactory;
      nodeLocalId: string;
      ids: number[];
      models: Record<number, Model>;
      data: Record<number, any>;
    }
    const idMap: Map<ModelFactory, IDMapForModelRelations> = new Map();
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
        idMap.set(modelFactory, {
          factory: modelFactory,
          nodeLocalId,
          ids,
          models: {},
          data: {}
        });
      }
    });
    // For each model relation, load the models by their ids
    for (let [factory, { ids, models }] of idMap) {
      const results = await findBy({
        query: {
          $model: modelFactory,
          id: [PersistMatcherType.ONE_OF, [ids]]
        }
      });
      results.forEach(result => {
        models[result.id] = factory(result);
      });
    }
    // Now, we've loaded all related models in an in-memory store. Let's
    // attach them to the underlying models
    return results.map(result => {
      const model = modelFactory(result);
      for (let [_, { nodeLocalId, models }] of idMap) {
        const id = model[nodeLocalId];
        model.$setRelationship(nodeLocalId, models[id]);
      }
      return model;
    });
  };
}
