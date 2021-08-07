import { Config } from "knex";
import { MetaData, Generator } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath } from "./helpers";

export const baseQueryTypeScript: Generator = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    knexConnectionOptions?: Config;
  } = {}
) => {
  const schemaPascal = generateNames(schema.name).rawPascal;
  const connectionOptions = options.knexConnectionOptions
    ? JSON.stringify(options.knexConnectionOptions)
    : "";
  let code = `export const get${schemaPascal}Connection = () => knex(${connectionOptions});\n\n`;

  for (const table of schema.tables) {
    const entityName = metaData.tableEntityNames.get(
      getSchemaAndTablePath(schema.name, table.name)
    );
    const pluralEntityName = generateNames(entityName).pluralPascal;
    code += `export function ${pluralEntityName}<Result = ${entityName}[]>(
  options: options = { connection: get${schemaPascal}Connection() }
) {
  return options.connection<${entityName}, Result>("${table.name}");
};\n\n`;
  }

  return code;
};
