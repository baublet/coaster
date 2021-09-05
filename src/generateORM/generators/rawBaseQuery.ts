import { MetaData, GeneratorResult } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import {
  getSchemaAndTablePath,
  getTestColumnDefinitionForColumn,
} from "./helpers";

/**
 * Generates the lowest-level possible accessor for accessing data in a table
 * using raw database types.
 */
export const rawBaseQuery = (
  schema: RawSchema,
  metaData: MetaData
): GeneratorResult => {
  metaData.setHeader(
    "knex",
    metaData.templateManager.render({
      template: "rawBaseQuery/knex",
    })
  );

  let code = "";
  let testCode = "";

  for (const table of schema.tables) {
    const entityName = metaData.tableRawEntityNames.get(
      getSchemaAndTablePath(schema.name, table.name)
    );
    const pluralEntityName = generateNames(entityName).pluralPascal;
    code += metaData.templateManager.render({
      template: "rawBaseQuery/query",
      variables: {
        entityName,
        pluralEntityName,
        tableName: table.name,
      },
    });
    metaData.rawBaseQueryFunctionNames.set(
      getSchemaAndTablePath(schema.name, table.name),
      pluralEntityName
    );

    if (!metaData.generateTestCode) {
      continue;
    }
    testCode += metaData.templateManager.render({
      template: "rawBaseQuery/query.test",
      variables: {
        pluralEntityName,
        codeOutputFullPath: metaData.codeOutputFullPath,
        testConnectionVariable: metaData.testConnectionVariable,
      },
    });
  }

  // If necessary, build the basic, least-testable-unit migration for the schema
  if (metaData.generateTestCode) {
    const functionName = `getMigrationsFor${schema.name}`;
    let tables = "";
    // First, make all of the necessary tables
    for (const table of schema.tables) {
      tables += `  knex.schema.createTable('${table.name}', (table) => {\n`;
      tables += table.columns
        .map((column) => getTestColumnDefinitionForColumn(column, table))
        .join("");
      tables += `  });\n`;
    }

    testCode += `export function ${functionName}(knex: ConnectionOrTransaction) {\n${tables}}`;

    // TODO: impose all of the constraints
  }

  return {
    code,
    testCode,
  };
};
