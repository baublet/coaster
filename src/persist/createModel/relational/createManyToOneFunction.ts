import { SchemaNodeWithManyToOne } from "schema/relationship/schema";
import { Schema } from "schema";
import { Maybe } from "helpers";

import { DenormalizerFactorySingle } from "./createDenormalizeModelsFunction";
import { Connection } from "../../connection";
import { NormalizedModel, ModelFactoryOptions } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";
import { batchLoaderOne } from "./batchLoaderOne";

interface ManyToOneArguments {
  connection: Connection;
  property: SchemaNodeWithManyToOne;
  schema: Schema;
}

export function createManyToOneFunction<
  PNM extends NormalizedModel,
  CNM extends NormalizedModel
>({
  connection,
  property,
  schema,
}: ManyToOneArguments): DenormalizerFactorySingle<PNM, CNM> {
  const foreignIdField =
    property.foreignColumn ||
    getUniqueIdFieldForEntityInSchema(schema, property.of);
  const foreignTableName = getTableNameForEntityInSchema(schema, property.of);

  const batchLoader = batchLoaderOne({
    connection,
    idField: foreignIdField,
    tableName: foreignTableName,
  });

  return (parent: PNM) => {
    const foreignId = parent[foreignIdField];

    let attempted = false;
    let loadedEntity: Maybe<CNM>;

    async function manyToOne(options: ModelFactoryOptions = {}) {
      if (!loadedEntity) {
        if (attempted) {
          // We tried to find it, but couldn't. Don't try again
          return null;
        }
        attempted = true;
        if (!options.connection || options.connection === connection) {
          loadedEntity = (await batchLoader(foreignId)) as CNM | null;
        } else {
          const results = await (options.connection || connection)
            .table(foreignTableName)
            .select("*")
            .where({ [foreignIdField]: foreignId })
            .limit(1);
          if (results.length > 0) {
            loadedEntity = results[0];
          }
        }
      }
      return loadedEntity;
    }

    return manyToOne;
  };
}
