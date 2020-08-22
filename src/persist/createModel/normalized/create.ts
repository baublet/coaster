import { NormalizedModelFactory, NormalizedModel } from "../createModel";
import { Connection } from "persist/connection";

import { CreateModelFactoryFullArguments } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "persist/helpers/getUniqueIdFieldForEntityInSchema";

async function createAndReturn<NM extends NormalizedModel>(
  connection: Connection,
  tableName: string,
  uniqueIdField: string,
  data: Partial<NM>
): Promise<NM> {
  const id = await connection.table(tableName).insert(data);
  const results = await connection
    .table(tableName)
    .select("*")
    .where({ [uniqueIdField]: id[0] })
    .limit(1);
  if (results.length) {
    return results[0] as NM;
  }
  throw new Error(
    `Unable to find inserted ID ${id} on table ${tableName} by its unique ID field, ${uniqueIdField}`
  );
}

export function createCreateFunction<NM extends NormalizedModel>({
  schema,
  entity,
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["create"] {
  const uniqueIdField = getUniqueIdFieldForEntityInSchema(schema, entity);
  async function create(
    modelOrModels: Partial<NM>[] | Partial<NM>
  ): Promise<NM | NM[]> {
    if (Array.isArray(modelOrModels)) {
      const promises = modelOrModels.map((data) =>
        createAndReturn<NM>(connection, tableName, uniqueIdField, data)
      );
      return Promise.all(promises);
    }
    return createAndReturn<NM>(
      connection,
      tableName,
      uniqueIdField,
      modelOrModels
    );
  }

  return create as NormalizedModelFactory<NM>["create"];
}
