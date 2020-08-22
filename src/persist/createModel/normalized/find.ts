import { NormalizedModel } from "../createModel";

import { CreateModelFactoryFullArguments } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "persist/helpers/getUniqueIdFieldForEntityInSchema";

export function createFindFunction<NM extends NormalizedModel>({
  schema,
  entity,
  connection,
  tableName,
}: CreateModelFactoryFullArguments) {
  const uniqueIdField = getUniqueIdFieldForEntityInSchema(schema, entity);
  async function findFunction(idOrIds: string[] | number[] | string | number) {
    const idsToFind = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const results = await connection
      .table<NM>(tableName)
      .select("*")
      .whereIn(uniqueIdField, idsToFind)
      .limit(idsToFind.length);

    if (idsToFind.length > 1) {
      return results;
    }
    return results[0];
  }

  return findFunction;
}
