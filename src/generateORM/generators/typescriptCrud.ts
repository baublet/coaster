import { ConnectionOptions } from "../";
import { MetaData } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath } from "./helpers";

/**
 * Generates the lowest-level possible accessor for accessing data in a table
 * using raw database types.
 */
export const baseQueryTypeScript = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    knexConnectionOptions?: ConnectionOptions;
  } = { knexConnectionOptions: {} }
) => {
  const connectionOptions = options.knexConnectionOptions
    ? JSON.stringify(options.knexConnectionOptions)
    : "";

  metaData.setHeader("knex", 'import knex from "knex";');
  metaData.setHeader(
    "knex",
    `export const getDatabaseConnection = () => knex(${connectionOptions});`
  );

  let code = "";

  for (const table of schema.tables) {
    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    const entityName = metaData.tableEntityNames.get(schemaAndTablePath);
    const pluralEntityName = generateNames(entityName).pluralPascal;
    const entityInputType = `Partial<${entityName}>`;
    const rawBaseQueryFunctionName =
      metaData.rawBaseQueryFunctionNames.get(schemaAndTablePath);
    const rawEntityTypeName =
      metaData.tableRawEntityNames.get(schemaAndTablePath);
    const rawToNamedFunctionName =
      metaData.transformerFunctionNames[rawEntityTypeName][entityName];

    // Create
    code += `/** Insert a single ${entityName} into the database, returning ${
      schema.flavor === "mysql" ? "the inserted ID" : "the inserted entity"
    } */\n`;
    code += `export async function insert${entityName}(\n`;
    code += `  input: ${entityInputType},\n`;
    code += `  connection = getDatabaseConnection()\n`;
    if (schema.flavor === "mysql") {
      code += `): Promise<string | number> {\n`;
      code += `  const result = await ${rawBaseQueryFunctionName}(connection).insert(input);\n`;
      code += `  return result[0];\n`;
    } else {
      code += `): Promise<${entityName}> {\n`;
      code += `  const result = await ${rawBaseQueryFunctionName}(connection).insert(input).returning(*);\n`;
      code += `  return ${rawToNamedFunctionName}(result[0]);\n`;
    }
    code += `};\n\n`;

    // Read
    code += `/** Find many ${pluralEntityName} in the database by a constraint function */\n`;
    code += `export async function find${pluralEntityName}(\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, ${rawEntityTypeName}[]>) => void,\n`;
    code += `  connection = getDatabaseConnection()\n`;
    code += `): Promise<${entityName}[]> {\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}(connection);\n`;
    code += `  query(queryBuilder);\n`;
    code += `  const results = await queryBuilder;\n`;
    code += `  return results.map((rawEntity) => ${rawToNamedFunctionName}(rawEntity));\n`;
    code += `};\n\n`;

    // Update
    code += `/** Update a single entity */\n`;

    // Delete
  }

  return code;
};
