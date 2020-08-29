import { SchemaNodeWithManyToMany } from "schema/relationship/schema";
import { Schema } from "schema";

import { DenormalizerFactoryMultiple } from "./createDenormalizeModelsFunction";
import { Connection, RelationalDiscriminator } from "../../connection";
import { NormalizedModel, ModelFactoryOptions } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";
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

    async function manyToMany(
      discriminator?: RelationalDiscriminator,
      options: ModelFactoryOptions = {}
    ) {
      if (!attempted) {
        attempted = true;

        let builder = (options.connection || connection)
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
        const cleanedResults = results.map((r) => {
          const newObject = {};
          for (const [k, v] of Object.entries(r)) {
            if (!k.includes(`${foreignTableName}.`)) continue;
            newObject[k.replace(`${foreignTableName}.`, "")] = v;
          }
          return newObject as CNM;
        });

        if (cleanedResults.length > 0) {
          loadedEntities.push(...cleanedResults);
        }
      }
      return loadedEntities;
    }

    return manyToMany;
  };
}
