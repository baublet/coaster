import { PersistFindByProps, PersistMatcherType } from "persist";
import { Model, ModelDataDefaultType, ModelFactory } from "model/createModel";
import findResultsForLogicalMatcher from "persist/memory/findResultsForLogicalMatcher";
import { MemoryMap } from "persist/memory/memory";
import uniqueArrayElements from "helpers/uniqueArrayElements";
import eagerLoadWithoutSchemaError from "persist/errors/eagerLoadWithoutSchemaError";

export default function findByFactory(memoryMap: MemoryMap = {}) {
  return async function findBy({
    query,
    raw = false,
    eager = false
  }: PersistFindByProps): Promise<ModelDataDefaultType[] | Model[]> {
    // If the user tries to eager load a query, and they don't have a schema
    // defined, we need to throw. We can't ever eager load a query if we don't
    // know about relationships ahead of time.
    if (eager && !query.$model.schema) {
      throw eagerLoadWithoutSchemaError();
    }

    // Find the results
    const results = findResultsForLogicalMatcher(memoryMap, query);

    if (raw) {
      return results;
    }

    // Instantiate the new models
    const modelFactory = query.$model;
    if (eager === false) return results.map(result => modelFactory(result));

    // Eager load all additional related models
    interface IDMapForModelRelations {
      factory: ModelFactory;
      foreignKey: string;
      nodeLocalAccessor: string;
      nodeLocalId: string;
      ids: number[];
      models: Record<number, Model>;
      data: Record<number, any>;
    }

    const idMap: Map<ModelFactory, IDMapForModelRelations> = new Map();

    Object.values(modelFactory.schema).forEach(node => {
      if (node.relation === true) {
        const nodeLocalAccessor = `${node.names.original}`;
        const nodeLocalId = `${node.names.safe}`;
        const ids: (null | number)[] = uniqueArrayElements(
          results
            .map(result => {
              if (result[nodeLocalId]) return result[nodeLocalId];
              return null;
            })
            .filter(id => id !== null)
        );

        idMap.set(node.model, {
          factory: modelFactory,
          foreignKey: node.persistOptions.foreignKey,
          nodeLocalAccessor,
          nodeLocalId,
          ids,
          models: {},
          data: {}
        });
      }
    });

    // For each model relation, load the models by their ids
    for (let [factory, { foreignKey, ids, models }] of idMap) {
      const results = await findBy({
        query: {
          $model: factory,
          [foreignKey]: [PersistMatcherType.ONE_OF, ids]
        }
      });

      results.forEach(result => {
        models[result.id] = result;
      });
    }
    // Now, we've loaded all related models in an in-memory store. Let's
    // attach them to their parent model.
    return results.map(result => {
      const model = modelFactory(result);
      for (let [_, { nodeLocalId, nodeLocalAccessor, models }] of idMap) {
        const id = model[nodeLocalId];
        model.$setRelationship(nodeLocalAccessor, models[id]);
      }
      return model;
    });
  };
}
