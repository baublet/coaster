import { MetaData, GeneratorResult } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath } from "./helpers";

/**
 * Generates the lowest-level possible accessors and mutators for data in a
 * table.
 */
export const typedCrud = (
  schema: RawSchema,
  metaData: MetaData
): GeneratorResult => {
  metaData.setHeader(
    "knex",
    metaData.templateManager.render({ template: "rawBaseQuery/knex" })
  );

  let code = "";
  const testCode = "";

  for (const table of schema.tables) {
    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    const entityName = metaData.tableEntityNames.get(schemaAndTablePath);
    const pluralEntityName = generateNames(entityName).pluralPascal;
    const rawBaseQueryFunctionName =
      metaData.rawBaseQueryFunctionNames.get(schemaAndTablePath);
    const rawEntityTypeName =
      metaData.tableRawEntityNames.get(schemaAndTablePath);
    const rawToNamedFunctionName =
      metaData.transformerFunctionNames[rawEntityTypeName][entityName];
    const namedToRawFunctionName =
      metaData.transformerFunctionNames[entityName][rawEntityTypeName];
    const entityInputType =
      metaData.namedEntityInputTypeNames.get(schemaAndTablePath);

    // Create

    if (schema.flavor === "mysql") {
      code += metaData.templateManager.render({
        template: "typedCrud/insert.mysql",
        variables: {
          entityInputType,
          entityName,
          pluralEntityName,
          returnType: table.primaryKeyType,
          rawToNamedFunctionName,
          rawBaseQueryFunctionName,
        },
      });
    } else {
      code += metaData.templateManager.render({
        template: "typedCrud/insert.pg",
        variables: {
          entityInputType,
          entityName,
          pluralEntityName,
          rawToNamedFunctionName,
          rawBaseQueryFunctionName,
        },
      });
    }

    // Read
    code += metaData.templateManager.render({
      template: "typedCrud/find",
      variables: {
        entityName,
        pluralEntityName,
        rawBaseQueryFunctionName,
        rawEntityTypeName,
        rawToNamedFunctionName,
      },
    });

    // Update
    code += metaData.templateManager.render({
      template: "typedCrud/update",
      variables: {
        entityInputType,
        namedToRawFunctionName,
        rawBaseQueryFunctionName,
        rawEntityTypeName,
        tablePrimaryKeyColumn: table.primaryKeyType,
        pluralEntityName,
        entityName,
      },
    });

    // Delete
    code += `/** Deletes a ${entityName} */\n`;
    code += `export async function delete${entityName}(\n`;
    code += `  entity: ${entityName},\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    code += `): Promise<number> {\n`;
    code += `  return ${rawBaseQueryFunctionName}<number>(connection)\n`;
    code += `    .where("${table.primaryKeyColumn}", "=", entity.${table.primaryKeyColumn})\n`;
    code += `    .delete()\n`;
    code += `    .limit(1);\n`;
    code += `}\n\n`;

    // Delete where
    code += `/** Delete one or more ${pluralEntityName} under specific conditions */\n`;
    code += `export async function delete${entityName}Where(\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, number>) => unknown,\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    code += `): Promise<number> {\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}<number>(connection);\n`;
    code += `  await query(queryBuilder);\n`;
    code += `  queryBuilder.delete();\n`;
    code += `  return queryBuilder;\n`;
    code += `}\n\n`;
  }

  return {
    code,
    testCode,
  };
};
