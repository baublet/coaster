import { MetaData, GeneratorResult } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath } from "./helpers";

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
    `import knex from "knex";
export type Connection = knex<any, unknown[]>;
export type Transaction = knex.Transaction<any, any>;
export type ConnectionOrTransaction = Connection | Transaction;`
  );

  let code = "";
  let testCode = "";

  for (const table of schema.tables) {
    const entityName = metaData.tableRawEntityNames.get(
      getSchemaAndTablePath(schema.name, table.name)
    );
    const pluralEntityName = generateNames(entityName).pluralPascal;
    code += `export function ${pluralEntityName}<Result = ${entityName}[]>(
  connection: ConnectionOrTransaction
) {
  return connection<${entityName}, Result>("${table.name}");
};\n\n`;
    metaData.rawBaseQueryFunctionNames.set(
      getSchemaAndTablePath(schema.name, table.name),
      pluralEntityName
    );

    if (!metaData.generateTestCode) {
      continue;
    }
    testCode += `import { ${pluralEntityName} } from "${metaData.codeOutputFullPath}"

describe("${pluralEntityName}", () => {
  it("doesn't throw", () => {
    expect(() => ${pluralEntityName}(${metaData.testConnectionVariable})).not.toThrow();
  });
});\n\n`;
  }

  return {
    code,
    testCode,
  };
};
