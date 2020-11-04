import {
  NormalizedModelFactory,
  NormalizedModel,
  ModelFactoryOptions,
} from "../createModel";

import { CreateModelFactoryFullArguments } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "persist/helpers/getUniqueIdFieldForEntityInSchema";

export function createDeleteFunction<NM extends NormalizedModel>({
  schema,
  entity,
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["delete"] {
  const uniqueIdField = getUniqueIdFieldForEntityInSchema(schema, entity);
  async function deleteFunction(
    idOrIds: string[] | number[] | string | number,
    options: ModelFactoryOptions = {}
  ): Promise<number> {
    const idsToDelete = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return (options.connection || connection)
      .table(tableName)
      .delete()
      .whereIn(uniqueIdField, idsToDelete)
      .limit(idsToDelete.length);
  }

  return deleteFunction as NormalizedModelFactory<NM>["delete"];
}
