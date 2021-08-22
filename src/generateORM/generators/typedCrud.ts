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
    `import knex from "knex";
export type Connection = knex<any, unknown[]>;
export type Transaction = knex.Transaction<any, any>;
export type ConnectionOrTransaction = Connection | Transaction;`
  );

  let code = "";
  let testCode = "";

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
    code += `/**\n`;
    code += ` * Insert a single ${entityName} into the database, returning ${
      schema.flavor === "mysql" ? "the inserted ID" : "the inserted entity"
    }\n`;
    code += ` */\n`;
    code += `export async function insert${entityName}(\n`;
    code += `  input: ${entityInputType},\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    if (schema.flavor === "mysql") {
      code += `): Promise<${table.primaryKeyType}> {\n`;
      code += `  const result = await ${rawBaseQueryFunctionName}(connection).insert(input);\n`;
      code += `  return result[0];\n`;
    } else {
      code += `): Promise<${entityName}> {\n`;
      code += `  const rawInput = ${namedToRawFunctionName}(input);\n`;
      code += `  const result = await ${rawBaseQueryFunctionName}(connection).insert(rawInput).returning("*");\n`;
      code += `  return ${rawToNamedFunctionName}(result[0]);\n`;
    }
    code += `};\n\n`;

    code += `/**\n`;
    code += ` * Inserts one ore more ${pluralEntityName} into the database, returning ${
      schema.flavor === "mysql" ? "the inserted IDs" : "the inserted entities"
    }\n`;
    code += ` */\n`;
    code += `export async function insert${pluralEntityName}(\n`;
    code += `  input: ${entityInputType}[],\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    if (schema.flavor === "mysql") {
      code += `): Promise<${table.primaryKeyType}[]> {\n`;
    } else {
      code += `): Promise<${entityName}[]> {\n`;
    }
    code += `  const rawInput = input.map(input => ${namedToRawFunctionName}(input));\n`;
    code += `  const results = await ${rawBaseQueryFunctionName}(connection).insert(rawInput)${
      schema.flavor === "pg" ? '.returning("*")' : ""
    };\n`;
    code += `  return results.map(rawEntity => ${rawToNamedFunctionName}(rawEntity));\n`;
    code += `};\n\n`;

    // Read
    code += `/** Find many ${pluralEntityName} in the database by a constraint function */\n`;
    code += `export async function find${pluralEntityName}(\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, ${rawEntityTypeName}[]>) => unknown,\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    code += `): Promise<${entityName}[]> {\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}(connection);\n`;
    code += `  await query(queryBuilder);\n`;
    code += `  const results = await queryBuilder;\n`;
    code += `  return results.map((rawEntity) => ${rawToNamedFunctionName}(rawEntity));\n`;
    code += `};\n\n`;

    // Find one where or fail
    code += `/** Find a ${entityName} in the database or fail */\n`;
    code += `export async function find${entityName}OrFail(\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, ${rawEntityTypeName}[]>) => unknown,\n`;
    code += `  connection: ConnectionOrTransaction\n`;
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
    code += `/** Update a single ${entityName} */\n`;
    code += `export async function update${entityName}(\n`;
    code += `  entity: ${entityInputType},\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    code += `): Promise<void> {\n`;
    code += `  const {${table.primaryKeyColumn}, ...rawInput} = ${namedToRawFunctionName}(entity);\n`;
    code += `  await ${rawBaseQueryFunctionName}(connection)\n`;
    code += `    .update(rawInput)\n`;
    code += `    .where("${table.primaryKeyColumn}", "=", entity.${table.primaryKeyColumn})\n`;
    code += `    .limit(1);\n`;
    code += `}\n\n`;

    // Update where
    code += `/** Update one or more ${pluralEntityName} under specific conditions */\n`;
    code += `export async function update${entityName}Where(\n`;
    code += `  updatePayload: Partial<${entityInputType}>,\n`;
    code += `  query: (query: knex.QueryBuilder<${rawEntityTypeName}, number>) => unknown,\n`;
    code += `  connection: ConnectionOrTransaction\n`;
    code += `): Promise<void> {\n`;
    code += `  const rawUpdatePayload = ${namedToRawFunctionName}(updatePayload);\n`;
    code += `  const queryBuilder = ${rawBaseQueryFunctionName}(connection).update(rawUpdatePayload);\n`;
    code += `  await query(queryBuilder);\n`;
    code += `  await queryBuilder;\n`;
    code += `}\n\n`;

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
