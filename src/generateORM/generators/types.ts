import { MetaData, Generator } from ".";
import { RawSchema } from "../drivers";
import { getName } from "./helpers";

export const types: Generator = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    typesOrInterfaces: "types" | "interfaces";
    prefixSchemaName: boolean;
    getName?: (schema: string, table?: string, column?: string) => string;
  } = { typesOrInterfaces: "interfaces", prefixSchemaName: false }
) => {
  let code = "";

  const typeMap = new Map<string, string>();

  for (const table of schema.tables) {
    const tableName = getName(
      schema.name,
      table.name,
      undefined,
      options.prefixSchemaName,
      options.getName
    );
    if (table.comment) {
      code += `\n/** ${table.comment} */\n`;
    }
    code += `${
      options.typesOrInterfaces === "interfaces" ? "interface" : "type"
    } ${tableName} ${options.typesOrInterfaces === "interfaces" ? "" : "= "}{`;

    typeMap.set(`${schema.name}.${table.name}`, tableName);

    for (const column of table.columns) {
      const propertyName = getName(
        schema.name,
        table.name,
        column.name,
        options.prefixSchemaName,
        options.getName
      );
      if (column.comment) {
        code += `\n/** ${table.comment} */`;
      }
      code += `\n${propertyName}`;
      code += column.nullable ? "?: " : ": ";
      code += column.type;
      code += ";\n";
    }
    code += `};\n`;
  }

  metaData.types = typeMap;

  return code;
};
