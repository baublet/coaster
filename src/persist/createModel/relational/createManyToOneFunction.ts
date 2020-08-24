import { SchemaNodeWithManyToOne } from "schema/relationship/schema";
import { Schema } from "schema";
import { Maybe } from "helpers";

import { DenormalizerFactorySingle } from "./createDenormalizeModelsFunction";
import { Connection } from "../../connection";
import { NormalizedModel } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";

interface ManyToOneArguments {
  connection: Connection;
  localEntityName: string;
  property: SchemaNodeWithManyToOne;
  schema: Schema;
}

export function createManyToOneFunction<
  PNM extends NormalizedModel,
  CNM extends NormalizedModel
>({
  connection,
  localEntityName,
  property,
  schema,
}: ManyToOneArguments): DenormalizerFactorySingle<PNM, CNM> {
  const foreignIdField =
    property.foreignColumn ||
    getUniqueIdFieldForEntityInSchema(schema, property.of);
  const foreignTableName = getTableNameForEntityInSchema(
    schema,
    localEntityName
  );

  return (parent: PNM) => {
    const foreignId = parent[foreignIdField];

    let attempted = false;
    let loadedEntity: Maybe<CNM>;

    async function manyToOne() {
      if (!loadedEntity) {
        if (attempted) {
          // We tried to find it, but couldn't. Don't try again
          return null;
        }
        attempted = true;
        const results = await connection
          .table(foreignTableName)
          .select("*")
          .where({ [foreignIdField]: foreignId })
          .limit(1);
        if (results.length > 0) {
          loadedEntity = results[0];
        }
      }
      return loadedEntity;
    }

    return manyToOne;
  };
}
