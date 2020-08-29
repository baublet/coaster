import { SchemaNodeWithOneToMany } from "schema/relationship/schema";
import { Schema } from "schema";

import { DenormalizerFactoryMultiple } from "./createDenormalizeModelsFunction";
import {
  Connection,
  RelationalDiscriminator,
  isConnection,
} from "../../connection";
import { NormalizedModel, ModelFactoryOptions } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";
import { getForeignIdFieldForRelationship } from "../../helpers/getForeignIdFieldForRelationship";
import { getEntityFromSchemaByName } from "persist/helpers/getEntityFromSchemaByName";
import { batchLoaderMany } from "./batchLoaderMany";

interface OneToManyArguments {
  connection: Connection;
  localEntityName: string;
  property: SchemaNodeWithOneToMany;
  schema: Schema;
}

export function createOneToManyFunction<
  PNM extends NormalizedModel,
  CNM extends NormalizedModel
>({
  connection,
  localEntityName,
  property,
  schema,
}: OneToManyArguments): DenormalizerFactoryMultiple<PNM, CNM> {
  const localEntity = getEntityFromSchemaByName(schema, localEntityName);
  const localIdField = getUniqueIdFieldForEntityInSchema(
    schema,
    localEntityName
  );
  const foreignIdField = getForeignIdFieldForRelationship(
    property,
    localEntity
  );
  const foreignTableName = getTableNameForEntityInSchema(schema, property.of);

  const batchLoader = batchLoaderMany<CNM>({
    connection,
    searchColumn: foreignIdField,
    tableName: foreignTableName,
  });

  return (parent: PNM) => {
    const localId = parent[localIdField];

    async function oneToMany(
      discriminator?: RelationalDiscriminator,
      options: ModelFactoryOptions = {}
    ) {
      const loadedEntities: CNM[] = [];
      const resolvedConnection = isConnection(discriminator)
        ? discriminator
        : options.connection || connection;

      // We can use a batch loader if the developer doesn't pass a custom
      // connection and doesn't want to constrain the results.
      if (!options.connection && !discriminator) {
        const results = await batchLoader(localId);
        loadedEntities.push(...results);
      } else {
        let builder = resolvedConnection
          .table(foreignTableName)
          .select("*")
          .where({ [foreignIdField]: localId });

        if (discriminator) {
          builder = discriminator(builder);
        }

        const results = await builder;

        if (results.length > 0) {
          loadedEntities.push(...results);
        }
      }
      return loadedEntities;
    }

    return oneToMany;
  };
}
