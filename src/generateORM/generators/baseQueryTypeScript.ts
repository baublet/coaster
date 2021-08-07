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
  let code = `import knex from "knex";\n\n`;
  code += `export const getDatabaseConnection = () => knex(${connectionOptions});\n\n`;

  for (const table of schema.tables) {
    const entityName = metaData.tableEntityNames.get(
      getSchemaAndTablePath(schema.name, table.name)
    );
    const pluralEntityName = generateNames(entityName).pluralPascal;
    code += `export function ${pluralEntityName}<Result = ${entityName}[]>(
  connection = getDatabaseConnection()
) {
  return connection<${entityName}, Result>("${table.name}");
};\n\n`;
  }

  return code;
};
