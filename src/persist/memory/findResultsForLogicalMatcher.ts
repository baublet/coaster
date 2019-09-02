import { Model, ModelData } from "../../model/createModel";
import {
  PersistSelectQuery,
  PersistMatcherType,
  PersistSelectWithQuery,
  PersistSortDirection
} from "..";
import dataIsMatch from "./dataIsMatch";
import { MemoryMap } from "./memory";
import uniqueArrayElements from "../../helpers/uniqueArrayElements";
import cloneDeep from "lodash.clonedeep";
import orderBy from "lodash.orderby";

export default function findResultsForLogicalMatcher(
  memoryMap: MemoryMap,
  {
    $and = false,
    $limit = undefined,
    $model,
    $offset = 0,
    $or = false,
    $sort = [],
    $with = [],
    $without = [],
    ...query
  }: PersistSelectQuery | PersistSelectWithQuery,
  tableName: string = null
): ModelData[] {
  let results: ModelData[] = [];

  const table = tableName || $model.schema.$tableName || $model.modelName;
  const rawData = Object.values(memoryMap[table]);
  const keysToSearch = Object.keys(query);

  const isAnd = $or !== true;

  const keySearches = keysToSearch.map(key => {
    const comparator = Array.isArray(query[key])
      ? query[key][0]
      : // But by default, it's an equality check
        PersistMatcherType.EQUAL;
    const value = Array.isArray(query[key]) ? query[key][1] : query[key];

    return (modelData: ModelData) => {
      return dataIsMatch(modelData, {
        property: key,
        type: comparator,
        value: value
      });
    };
  });

  if (isAnd) {
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
    results.push(...findResultsForLogicalMatcher(memoryMap, query, table));
  });

  // Remove $without
  const $withoutQueries = Array.isArray($without) ? $without : [$without];
  $withoutQueries.forEach(query => {
    const rowsToRemove = findResultsForLogicalMatcher(memoryMap, query, table);
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

  // Sort them
  $sort = Array.isArray($sort) ? $sort : [$sort];
  if ($sort.length > 0) {
    const sortFields = $sort.map(option => option.property);
    const sortDirections = $sort.map(option =>
      option.direction === PersistSortDirection.DESC ? "desc" : "asc"
    );
    results = orderBy(results, sortFields, sortDirections);
  }

  // Deep clone it all so we can maintain the validity of our store
  const clonedResults = cloneDeep(results);

  // Respect offset
  if ($offset > 0) {
    clonedResults.splice(0, $offset);
  }

  // Respect limit
  if (results.length > $limit) {
    clonedResults.splice($limit, results.length - $limit);
  }

  return clonedResults;
}
