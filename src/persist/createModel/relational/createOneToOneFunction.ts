import { SchemaNodeWithOneToOne } from "schema/relationship/schema";
import { Schema } from "schema";
import { Maybe } from "helpers";

import { DenormalizerFactorySingle } from "./createDenormalizeModelsFunction";
import { Connection } from "../../connection";
import { NormalizedModel } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";
import { getEntityFromSchemaByName } from "../../helpers/getEntityFromSchemaByName";
import { getForeignIdFieldForRelationship } from "../../helpers/getForeignIdFieldForRelationship";

interface OneToOneArguments {
  connection: Connection;
  localEntityName: string;
  property: SchemaNodeWithOneToOne;
  schema: Schema;
}

export function createOneToOneFunction<
  PNM extends NormalizedModel,
  CNM extends NormalizedModel
>({
  connection,
  localEntityName,
  property,
  schema,
}: OneToOneArguments): DenormalizerFactorySingle<PNM, CNM> {
  const localEntity = getEntityFromSchemaByName(schema, localEntityName);
  const localIdField =
    property.localColumn ||
    getUniqueIdFieldForEntityInSchema(schema, localEntityName);
  const foreignIdField =
    property.foreignColumn ||
    getForeignIdFieldForRelationship(property, localEntity);
  const foreignTableName = getTableNameForEntityInSchema(
    schema,
    localEntityName
  );

  return (parent: PNM) => {
    const localId = parent[localIdField];

    let attempted = false;
    let loadedEntity: Maybe<CNM>;

    async function oneToOne() {
      if (!loadedEntity) {
        if (attempted) {
          // We tried to find it, but couldn't. Don't try again
          return null;
        }
        attempted = true;
        const results = await connection
          .table(foreignTableName)
          .select("*")
          .where({ [foreignIdField]: localId })
          .limit(1);
        if (results.length > 0) {
          loadedEntity = results[0];
        }
      }
      return loadedEntity;
    }

    return oneToOne;
  };
}
