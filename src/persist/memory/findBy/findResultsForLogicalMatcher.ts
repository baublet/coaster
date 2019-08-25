import { Model, ModelData } from "../../../model/createModel";
import {
  PersistSelectQuery,
  PersistMatcherType,
  PersistSelectWithQuery
} from "../..";
import dataIsMatch from "./dataIsMatch";
import { MemoryMap } from "../memory";
import uniqueArrayElements from "../../../helpers/uniqueArrayElements";
import firstObjectByProp from "../../../helpers/firstObjectByProp";

export default function findResultsForLogicalMatcher(
  memoryMap: MemoryMap,
  {
    $model,
    $and = true,
    $or = false,
    $with = [],
    $without = [],
    $merge = [],
    ...query
  }: PersistSelectQuery | PersistSelectWithQuery,
  modelContext: string = null
): ModelData[] {
  let results: ModelData[] = [];

  const currentModel = modelContext || $model.modelName;
  const rawData = Object.values(memoryMap[currentModel]);
  const keysToSearch = Object.keys(query);

  const keySearches = keysToSearch.map(key => {
    const comparator = Array.isArray(query[key])
      ? // You can define your own comparator type here
        query[key][0]
      : // But by default, it's rote equality
        PersistMatcherType.EQUAL;

    return (modelData: ModelData) => {
      return dataIsMatch(modelData, {
        property: key,
        type: comparator,
        value: query[key]
      });
    };
  });

  if (!$or) {
    const filter = (modelData: ModelData): boolean => {
      for (let i = 0; i < keySearches.length; i++) {
        // If the model isn't a match for one of the properties, filter it out
        if (!keySearches[i](modelData)) {
          return false;
        }
      }
      return true;
    };

    results.push(...rawData.filter(filter));
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

    results.push(...rawData.filter(filter));
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
    const rowsToRemove = findResultsForLogicalMatcher(
      memoryMap,
      query,
      currentModel
    );
    const idsToRemove = rowsToRemove.map(row => row.id);
    results = results.filter(row => !idsToRemove.includes(row.id));
  });

  // If we get this far and there are no results and no keys to search for,
  // we treat it as a select all.
  if (!results.length && !keysToSearch.length) {
    results = rawData;
  }

  // Keep only unique
  results = uniqueArrayElements(results, (a, b) => a.id === b.id);

  return results;
}
