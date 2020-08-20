import { NormalizedModelFactory, Model, NormalizedModel } from "../createModel";

import { CreateModelFactoryFullArguments } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "persist/helpers/getUniqueIdFieldForEntityInSchema";

export function createFindFunction<
  M extends Model,
  NM extends NormalizedModel
>({
  schema,
  entity,
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<M, NM>["find"] {
  const uniqueIdField = getUniqueIdFieldForEntityInSchema(schema, entity);
  async function findFunction(
    idOrIds: string[] | number[] | string | number
  ): Promise<NM | NM[]> {
    const idsToFind = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const results = await connection
      .table(tableName)
      .select("*")
      .whereIn(uniqueIdField, idsToFind)
      .limit(idsToFind.length);

    if (idsToFind.length > 1) {
      return results;
    }
    return results[0];
  }

  return findFunction as NormalizedModelFactory<M, NM>["find"];
}