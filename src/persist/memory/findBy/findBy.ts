import { PersistFindByProps, PersistMatcherType } from "persist";
import { Model, ModelDataDefaultType, ModelFactory } from "model/createModel";
import findResultsForLogicalMatcher from "persist/memory/findResultsForLogicalMatcher";
import { MemoryMap } from "persist/memory/memory";
import uniqueArrayElements from "helpers/uniqueArrayElements";

export default function findByFactory(memoryMap: MemoryMap = {}) {
  return async function findBy({
    query,
    raw = false,
    eager = false
  }: PersistFindByProps): Promise<ModelDataDefaultType[] | Model[]> {
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

    // Map through the schema and load all of the properties we need to
    // eagerly load.
    const relations: ({
      nodeLocalAccessor: string;
      many: boolean;
      model: ModelFactory;
    })[] = modelFactory.relationships.map(relation => {
      if (Array.isArray(relation)) {
        return {
          nodeLocalAccessor: relation[0].names.pluralSafe,
          many: true,
          model: relation[0]
        };
      }
      return {
        nodeLocalAccessor: relation.names.safe,
        many: false,
        model: relation
      };
    });

    relations.forEach(({ nodeLocalAccessor, model }) => {
      const nodeLocalId = `${model.names.safe}_id`;
      const ids: (null | number)[] = uniqueArrayElements(
        results
          .map(result => {
            if (result[nodeLocalId]) return result[nodeLocalId];
            return null;
          })
          .filter(id => id !== null)
      );

      idMap.set(model, {
        factory: model,
        foreignKey: "id",
        nodeLocalAccessor,
        nodeLocalId,
        ids,
        models: {},
        data: {}
      });
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
    // attach them to their parent model and return the result.
    return results.map(result => {
      const model = modelFactory(result);
      for (let [, { nodeLocalId, nodeLocalAccessor, models }] of idMap) {
        const id = model[nodeLocalId];
        model.$setRelationship(nodeLocalAccessor, models[id]);
      }
      return model;
    });
  };
}
