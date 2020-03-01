import { Model } from "model";
import { PersistedModelFactory } from "./types";
import cannotLoadInvariantRelationships from "./error/cannotLoadInvariantRelationships";

type ModelMap = Map<
  // The accessorName or the unique symbol of the ModelFactory
  Symbol | string,
  // Map of the models loaded in <id, Model>
  Record<string, Model>
>;

type ModelNeeds = Record<
  // The model ID
  string,
  // First string here is the accessor name (settings in "user.settings")
  Record<string, string | string[]>
>;

/**
 * Attaches relationships to a set of models of the same type.
 * @param persist
 * @param model
 */
export async function loadRelationships(
  models: Model[],
  depth: number = 0,
  // The below properties are for recursion purposes only. Do not modify
  // these or pass them in manually.
  modelMap?: ModelMap,
  modelNeeds?: ModelNeeds,
  bridgeQueries: number = 0,
  modelQueries: number = 0
): Promise<{
  totalQueries: number;
  bridgeQueries: number;
  modelQueries: number;
}> {
  if (!models.length) return;

  // Never let users pass different types of models here
  const leftFactory: PersistedModelFactory = models[0].$factory as any;
  for (const model of models) {
    if (model.$factory === leftFactory) continue;
    throw cannotLoadInvariantRelationships(models);
  }

  const persist = leftFactory.$options.persist.with;

  const operations = [];
  const collators = [];

  modelMap = modelMap || new Map<Symbol | string, Record<string, Model>>();
  modelNeeds = modelNeeds || {};

  const leftFactoryPrimaryKey = leftFactory.$options.persist.primaryKey;

  leftFactory.$relationships.forEach(relationshipArgs => {
    const isMultiple = relationshipArgs.many;

    const rightFactory = relationshipArgs.modelFactory;
    const rightFactoryPrimaryKey = rightFactory.$options.persist.primaryKey;

    const {
      bridgeTableName,
      localKey,
      foreignKey,
      accessor
    } = relationshipArgs;

    // Operations grab stuff from the database
    operations.push(async () => {
      // First, query the join table for relationships to load which right-hand
      // into the database. We only want to load IDs that we haven't already
      // queried for. (This is important during recursive calls.)
      const loadedIds = Object.keys(modelNeeds);
      const ids = models
        .map(model => model[leftFactoryPrimaryKey])
        .filter(id => !loadedIds.includes(id));

      // If we've already loaded all the leftModel needs, we can skip the rest
      // of this operation.
      if (!ids.length) return;

      const results = await persist(bridgeTableName)
        .whereIn(localKey, ids)
        .select([localKey, foreignKey]);
      bridgeQueries++;

      // Then, grab all the models we need for this relationship
      const resultIds = results
        .map(result => {
          const leftId = result[localKey];
          if (!modelNeeds[leftId]) modelNeeds[leftId] = {};
          // This allows us to cross-reference models to what relationships we
          // need to attach to them
          if (!modelNeeds[leftId][accessor])
            modelNeeds[leftId][accessor] = isMultiple ? [] : null;

          if (isMultiple) {
            (modelNeeds[leftId][accessor] as string[]).push(result[foreignKey]);
          } else {
            (modelNeeds[leftId][accessor] as string) = result[foreignKey];
          }

          return result[foreignKey];
        })
        .filter(id => {
          // If we haven't loaded any of these model types, yet, load them all
          if (!modelMap.has(rightFactory.$id)) return true;
          const modelsLoaded = modelMap.get(rightFactory.$id);
          return !modelsLoaded[id];
        });

      // If we have already loaded up all the rightModels, we can skip the rest
      // of this operation
      if (!resultIds.length) return;

      // Now that we have queued up all the right-side IDs we need to load,
      // here's where we grab that data.
      const rightModelData = await rightFactory.find(resultIds as string[]);
      modelQueries++;

      rightModelData.forEach(newModel => {
        const symbol = rightFactory.$id;

        // We map by both accessor and Symbol for smarter caching
        // between recursions
        const freshIdMap = {};
        if (!modelMap.has(symbol)) modelMap.set(symbol, freshIdMap);
        if (!modelMap.has(accessor)) modelMap.set(accessor, freshIdMap);
        modelMap.get(symbol)[newModel[rightFactoryPrimaryKey]] = newModel;
      });
    });

    // Our collators attach relationships to their parent models
    collators.push(() => {
      models.forEach(model => {
        // For each right model data, load up the model from our map and set it
        // as a relationship
        const leftId = model[leftFactoryPrimaryKey];
        if (!modelNeeds[leftId]) modelNeeds[leftId] = {};
        const needs = modelNeeds[leftId][accessor];

        let relationships: Model | Model[];
        if (needs === undefined) {
          relationships = isMultiple ? [] : null;
        } else {
          relationships = isMultiple
            ? ((needs as string[]) || []).map(id => modelMap.get(accessor)[id])
            : modelMap.get(accessor)[needs as string];
        }

        model.$setRelationship(accessor, relationships);
      });
    });
  });

  // Collators must run after our operations, or they will have nothing
  // to collate.
  await Promise.all(operations.map(op => op()));
  collators.forEach(op => op());

  // For more depth than just the first slew of models
  if (depth > 0) {
    await Promise.all(
      Array.from(modelMap.keys()).map(async (symbol: Symbol | string) => {
        if (typeof symbol === "string") return;
        const models = Object.values(modelMap.get(symbol));
        const newDepth = depth - 1;
        const {
          bridgeQueries: childBridgeQueries,
          modelQueries: childModelQueries
        } = await loadRelationships(models, newDepth, modelMap, modelNeeds);
        bridgeQueries += childBridgeQueries;
        modelQueries += childModelQueries;
      })
    );
  }

  return {
    totalQueries: bridgeQueries + modelQueries,
    bridgeQueries,
    modelQueries
  };
}
