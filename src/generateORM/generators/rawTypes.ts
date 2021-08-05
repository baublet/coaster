import { MetaData } from ".";
import { RawSchema } from "../drivers";
import { getName } from "./helpers";

export const rawTypes = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    typesOrInterfaces: "types" | "interfaces";
    prefixSchemaName?: boolean;
    rawPrefix?: string;
    getTypeName?: (
      schema: string,
      table: string,
      column: string
    ) => string | undefined;
  } = {
    typesOrInterfaces: "interfaces",
    prefixSchemaName: false,
    getTypeName: () => undefined,
  }
) => {
  let code = "";
  const rawPrefix = options.rawPrefix === undefined ? "Raw" : options.rawPrefix;

  for (const table of schema.tables) {
    const tableName = getName(
      schema.name,
      table.name,
      undefined,
      options.prefixSchemaName
    );

    const schemaAndTablePath = `${schema.name ? schema.name + "." : ""}${
      table.name
    }`;
    metaData.tableEntityNames.set(schemaAndTablePath, rawPrefix + tableName);
    metaData.entityTableNames.set(rawPrefix + tableName, schemaAndTablePath);

    if (table.comment) {
      code += `\n/** ${table.comment} */\n`;
    }

    code += `${
      options.typesOrInterfaces === "interfaces" ? "interface" : "type"
    } ${rawPrefix}${tableName} ${
      options.typesOrInterfaces === "interfaces" ? "" : "= "
    }{`;

    for (const column of table.columns) {
      if (column.comment) {
        code += `\n/** ${column.comment} */`;
      }
      code += `\n${column.name}`;
      code += column.nullable ? "?: " : ": ";
      code +=
        options.getTypeName?.(schema.name, table.name, column.name) ||
        column.type;
      code += ";";
    }

    code += `\n};\n`;
  }

  return code;
};
