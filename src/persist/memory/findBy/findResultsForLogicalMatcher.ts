import { Model } from "../../../model/createModel";
import {
  PersistSelectQuery,
  PersistMatcherType,
  PersistSelectWithQuery
} from "../..";
import modelIsMatch from "./modelIsMatch";
import uniqueModels from "../../../helpers/uniqueModels";
import { MemoryMap } from "../memory";

export default function findResultsForLogicalMatcher(
  memoryMap: MemoryMap,
  {
    $model,
    $and = true,
    $or = false,
    $with = [],
    $without = [],
    ...query
  }: PersistSelectQuery | PersistSelectWithQuery,
  modelContext: string = null
): Model[] {
  let results: Model[] = [];

  const currentModel = modelContext || $model.modelName;
  const models = Object.values(memoryMap[currentModel]);
  const keysToSearch = Object.keys(query);

  const keySearches = keysToSearch.map(key => {
    const comparator = Array.isArray(query[key])
      ? // You can define your own comparator type here
        query[key][0]
      : // But by default, it's rote equality
        PersistMatcherType.EQUAL;

    return (model: Model) => {
      return modelIsMatch(model, {
        property: key,
        type: comparator,
        value: query[key]
      });
    };
  });

  if (!$or) {
    const filter = (model: Model): boolean => {
      for (let i = 0; i < keySearches.length; i++) {
        // If the model isn't a match for one of the properties, filter it out
        if (!keySearches[i](model)) {
          return false;
        }
      }
      return true;
    };

    results.push(...models.filter(filter));
  } else {
    const filter = (model: Model): boolean => {
      for (let i = 0; i < keySearches.length; i++) {
        // If the model is a match for any property, keep it
        if (keySearches[i](model)) {
          return true;
        }
      }
      // Otherwise, ditch it
      return false;
    };

    results.push(...models.filter(filter));
  }

  // Add $with
  const $withQueries = Array.isArray($with) ? $with : [$with];
  $withQueries.forEach(query => {
    results.push(
      ...findResultsForLogicalMatcher(memoryMap, query, currentModel)
    );
  });

  // Remove $without
  const $withoutQueries = Array.isArray($without) ? $without : [$without];
  $withoutQueries.forEach(query => {
    const modelsToRemove = findResultsForLogicalMatcher(
      memoryMap,
      query,
      currentModel
    );
    const idsToRemove = modelsToRemove.map(m => m.data.id);
    results = results.filter(model => !idsToRemove.includes(model.data.id));
  });

  // Keep only unique
  return uniqueModels(results);
}
