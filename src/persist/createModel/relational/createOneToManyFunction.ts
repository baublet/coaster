import { SchemaNodeWithOneToMany } from "schema/relationship/schema";
import { Schema } from "schema";

import {
  DenormalizerFactoryMultiple,
} from "./createDenormalizeModelsFunction";
import { Connection, RelationalDiscriminator } from "../../connection";
import { NormalizedModel } from "../createModel";
import { getUniqueIdFieldForEntityInSchema } from "../../helpers/getUniqueIdFieldForEntityInSchema";
import { getTableNameForEntityInSchema } from "../../helpers/getTableNameForEntityInSchema";
import { getForeignIdFieldForRelationship } from "../../helpers/getForeignIdFieldForRelationship";
import { getEntityFromSchemaByName } from "persist/helpers/getEntityFromSchemaByName";

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
  const localIdField = getUniqueIdFieldForEntityInSchema(schema, localEntityName);
  const foreignIdField = getForeignIdFieldForRelationship(property, localEntity);
  const foreignTableName = getTableNameForEntityInSchema(schema, localEntityName);

  return (parent: PNM) => {
    const localId = parent[localIdField];

    let attempted = false;
    const loadedEntities: CNM[] = [];

    async function oneToMany(discriminator?: RelationalDiscriminator) {
      if (!attempted) {
        attempted = true;

        let builder = connection
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
