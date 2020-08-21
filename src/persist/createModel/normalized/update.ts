import { NormalizedModelFactory, Model, NormalizedModel } from "../createModel";
import { Connection } from "persist/connection";

import { CreateModelFactoryFullArguments } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "persist/helpers/getUniqueIdFieldForEntityInSchema";

async function updateAndReturn<NM extends NormalizedModel>(
  connection: Connection,
  tableName: string,
  uniqueIdField: string,
  id: string | number,
  data: Partial<NM>
): Promise<NM> {
  await connection
    .table(tableName)
    .update(data)
    .where({ [uniqueIdField]: id })
    .limit(1);
  const fetchedResults = await connection
    .table(tableName)
    .select("*")
    .where({ [uniqueIdField]: id })
    .limit(1);
  if (fetchedResults.length === 1) {
    return fetchedResults[0] as NM;
  }
  throw new Error(
    `Unable to find updated ID ${id} on table ${tableName} by its unique ID field, ${uniqueIdField}`
  );
}

export function createUpdateFunction<
  M extends Model,
  NM extends NormalizedModel
>({
  schema,
  entity,
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<M, NM>["update"] {
  const uniqueIdField = getUniqueIdFieldForEntityInSchema(schema, entity);
  async function update(
    modelOrId: Partial<NM> | string | number,
    maybeData?: Partial<NM>
  ): Promise<NM | NM[]> {
    if (typeof modelOrId === "object") {
      const id = modelOrId[uniqueIdField];
      if (!id) {
        throw new Error(
          `You cannot update a model or partial model without giving it a unique ID field. Expected the model to have a field called ${uniqueIdField}. Instead we got the keys: ${Object.keys(
            modelOrId
          )}`
        );
      }
      const data = { ...modelOrId };
      if (typeof data[uniqueIdField] !== "undefined") {
        delete data[uniqueIdField];
      }
      return updateAndReturn<NM>(
        connection,
        tableName,
        uniqueIdField,
        id,
        data
      );
    }
    const data = { ...maybeData };
    if (typeof data[uniqueIdField] !== "undefined") {
      delete data[uniqueIdField];
    }
    return updateAndReturn<NM>(
      connection,
      tableName,
      uniqueIdField,
      modelOrId,
      data
    );
  }

  return update as NormalizedModelFactory<M, NM>["update"];
}
