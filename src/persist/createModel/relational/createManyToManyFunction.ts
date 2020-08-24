import { SchemaNodeWithManyToMany } from "schema/relationship/schema";
import { Schema } from "schema";

import { DenormalizerFactoryMultiple } from "./createDenormalizeModelsFunction";
import { Connection, RelationalDiscriminator } from "../../connection";
import { NormalizedModel } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";
import { getForeignIdFieldForRelationship } from "../../helpers/getForeignIdFieldForRelationship";
import { getEntityFromSchemaByName } from "persist/helpers/getEntityFromSchemaByName";
import { getEntityReferentialColumnName } from "persist/helpers/getEntityReferentialColumnName";

interface ManyToManyArguments {
  connection: Connection;
  localEntityName: string;
  property: SchemaNodeWithManyToMany;
  schema: Schema;
}

export function createManyToManyFunction<
  PNM extends NormalizedModel,
  CNM extends NormalizedModel
>({
  connection,
  localEntityName,
  property,
  schema,
}: ManyToManyArguments): DenormalizerFactoryMultiple<PNM, CNM> {
  const joinTableName = property.through;

  const localEntity = getEntityFromSchemaByName(schema, localEntityName);
  const localIdField = getUniqueIdFieldForEntityInSchema(
    schema,
    localEntityName
  );
  const joinTableLocalColumn =
    property.localThroughColumn || getEntityReferentialColumnName(localEntity);

  const foreignEntity = getEntityFromSchemaByName(schema, property.of);
  const foreignIdField = getUniqueIdFieldForEntityInSchema(schema, property.of);
  const foreignTableName = getTableNameForEntityInSchema(
    schema,
    localEntityName
  );
  const joinTableForeignColumn =
    property.foreignThroughColumn ||
    getEntityReferentialColumnName(foreignEntity);

  return (parent: PNM) => {
    const localId = parent[localIdField];

    let attempted = false;
    const loadedEntities: CNM[] = [];

    async function manyToMany(discriminator?: RelationalDiscriminator) {
      if (!attempted) {
        attempted = true;

        let builder = connection
          .table(foreignTableName)
          .select("*")
          .join(joinTableName, (j) =>
            j.on(`${joinTableName}.${joinTableLocalColumn}`, "=", localId)
          )
          .join(foreignTableName, (j) =>
            j.on(
              `${foreignTableName}.${foreignIdField}`,
              "=",
              `${joinTableName}.${joinTableForeignColumn}`
            )
          );

        if (discriminator) {
          builder = discriminator(builder);
        }

        const results = await builder;

        if (results.length > 0) {
          // TODO: remove the namespaced column data
          loadedEntities.push(...results);
        }
      }
      return loadedEntities;
    }

    return manyToMany;
  };
}
