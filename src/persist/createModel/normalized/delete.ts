import { NormalizedModelFactory, Model, NormalizedModel } from "../createModel";

import { CreateModelFactoryFullArguments } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "persist/helpers/getUniqueIdFieldForEntityInSchema";

export function createDeleteFunction<
  M extends Model,
  NM extends NormalizedModel
>({
  schema,
  entity,
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<M, NM>["delete"] {
  const uniqueIdField = getUniqueIdFieldForEntityInSchema(schema, entity);
  async function deleteFunction(
    idOrIds: string[] | number[] | string | number
  ): Promise<number> {
    const idsToDelete = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return connection
      .table(tableName)
      .delete()
      .whereIn(uniqueIdField, idsToDelete)
      .limit(idsToDelete.length);
  }

  return deleteFunction as NormalizedModelFactory<M, NM>["delete"];
}
