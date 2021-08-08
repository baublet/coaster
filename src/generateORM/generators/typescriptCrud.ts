import { ConnectionOptions } from "../";
import { MetaData } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath } from "./helpers";

/**
 * Generates the lowest-level possible accessor for accessing data in a table
 * using raw database types.
 */
export const typescriptCrud = (
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
    const namedToRawFunctionName =
      metaData.transformerFunctionNames[entityName][rawEntityTypeName];

    // Create
    code += `/** Insert a single ${entityName} into the database, returning ${
      schema.flavor === "mysql" ? "the inserted ID" : "the inserted entity"
    } */\n`;
    code += `export async function insert${entityName}(\n`;
    code += `  input: ${entityInputType},\n`;
    code += `  connection = getDatabaseConnection()\n`;
    if (schema.flavor === "mysql") {
      code += `): Promise<${table.primaryKeyType}> {\n`;
      code += `  const result = await ${rawBaseQueryFunctionName}(connection).insert(input);\n`;
      code += `  return result[0];\n`;
    } else {
      code += `): Promise<${entityName}> {\n`;
      code += `  const rawInput = ${namedToRawFunctionName}(input);\n`;
      code += `  const result = await ${rawBaseQueryFunctionName}(connection).insert(rawInput).returning(*);\n`;
      code += `  return ${rawToNamedFunctionName}(result[0]);\n`;
    }
    code += `};\n\n`;

    // Read
    code += `/** Find many ${pluralEntityName} in the database by a constraint function */\n`;
    code += `export async function find${pluralEntityName}(\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, ${rawEntityTypeName}[]>) => void | Promise<void>,\n`;
    code += `  connection = getDatabaseConnection()\n`;
    code += `): Promise<${entityName}[]> {\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}(connection);\n`;
    code += `  await query(queryBuilder);\n`;
    code += `  const results = await queryBuilder;\n`;
    code += `  return results.map((rawEntity) => ${rawToNamedFunctionName}(rawEntity));\n`;
    code += `};\n\n`;

    // Find one where or fail
    code += `/** Find a ${entityName} in the database or fail */\n`;
    code += `export async function find${entityName}OrFail(\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, ${rawEntityTypeName}[]>) => void | Promise<void>,\n`;
    code += `  connection = getDatabaseConnection()\n`;
    code += `): Promise<${entityName}> {\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}(connection);\n`;
    code += `  await query(queryBuilder);\n`;
    code += `  queryBuilder.limit(1);\n`;
    code += `  const results = await queryBuilder;\n`;
    code += `  if(results.length === 0) {\n`;
    code += `    throw new Error("Error! Unable to find ${entityName} in find${entityName}OrFail call");\n`;
    code += `  }\n`;
    code += `  return ${rawToNamedFunctionName}(results[0])\n`;
    code += `};\n\n`;

    // Update
    code += `/** Update a single entity */\n`;
    code += `export async function update${entityName}(\n`;
    code += `  input: ${entityInputType},\n`;
    code += `  connection = getDatabaseConnection()\n`;
    code += `): Promise<void> {\n`;
    code += `  const {${table.primaryKeyColumn}, ...rawInput} = ${namedToRawFunctionName}(input);\n`;
    code += `  await ${rawBaseQueryFunctionName}(connection)\n`;
    code += `    .update(rawInput)\n`;
    code += `    .where("${table.primaryKeyColumn}", "=", ${table.primaryKeyColumn})\n`;
    code += `    .limit(1);\n`;
    code += `}\n`;

    // Update where
    code += `/** Update one more entities under specific conditions */\n`;
    code += `export async function update${entityName}Where(\n`;
    code += `  updatePayload: ${entityInputType},\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, void>) => void | Promise<void>,\n`;
    code += `  connection = getDatabaseConnection()\n`;
    code += `): Promise<void> {\n`;
    code += `  const rawUpdatePayload = ${namedToRawFunctionName}(updatePayload);\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}(connection).update(rawUpdatePayload);\n`;
    code += `  await query(queryBuilder);\n`;
    code += `  await queryBuilder;\n`;
    code += `}\n`;

    // Delete
  }

  return code;
};
