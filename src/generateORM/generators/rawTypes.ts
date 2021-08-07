import { MetaData, GetTypeName } from ".";
import { RawSchema } from "../drivers";
import { getName, getSchemaAndTablePath } from "./helpers";

/**
 * Creates types, guards, and assertions for the shape of data coming out of
 * and going into the database.
 */
export const rawTypes = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    typesOrInterfaces: "types" | "interfaces";
    prefixSchemaName?: boolean;
    rawPrefix?: string;
    getTypeName?: GetTypeName;
  } = {
    typesOrInterfaces: "interfaces",
    prefixSchemaName: false,
    getTypeName: () => undefined,
  }
) => {
  metaData.setHeader(
    "objectHasProperties",
    `function objectHasProperties(obj: Record<string, any>, properties: string[]): boolean {
  for(const property of properties) {
    if(!obj.hasOwnProperty(property)) {
      return false;
    }
  }
  return true;
}\n`
  );

  let code = "";
  const rawPrefix = options.rawPrefix === undefined ? "Raw" : options.rawPrefix;

  for (const table of schema.tables) {
    const entityName = getName(
      undefined,
      table.name,
      schema.name,
      options.prefixSchemaName
    );

    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    metaData.tableEntityNames.set(schemaAndTablePath, rawPrefix + entityName);
    metaData.entityTableNames.set(rawPrefix + entityName, schemaAndTablePath);

    if (table.comment) {
      code += `\n/** ${table.comment} */\n`;
    }

    code += `export ${
      options.typesOrInterfaces === "interfaces" ? "interface" : "type"
    } ${rawPrefix}${entityName} ${
      options.typesOrInterfaces === "interfaces" ? "" : "= "
    }{`;

    const rawRequiredColumnNames: string[] = [];
    for (const column of table.columns) {
      if (column.comment) {
        code += `\n/** ${column.comment} */`;
      }
      code += `\n${column.name}`;
      code += column.nullable ? "?: " : ": ";
      code +=
        options.getTypeName?.(
          column.type,
          column.name,
          table.name,
          schema.name
        ) || column.type;
      code += ";";
      if (!column.nullable) {
        rawRequiredColumnNames.push(column.name);
      }
    }

    code += `\n};\n`;

    const columnNamesAsJsonString = JSON.stringify(rawRequiredColumnNames);
    // Type assertions
    code += `export function assertIs${rawPrefix}${entityName}Like(subject: any): asserts subject is ${rawPrefix}${entityName} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return; }\n`;
    code += `  }\n`;
    code += `  throw new Error("Invariance violation! Expected subject to be a ${rawPrefix}${entityName}, but it was instead: " + JSON.stringify(subject));\n`;
    code += `}\n`;

    metaData.typeAssertionFunctionNames.set(
      schemaAndTablePath,
      `assertIs${rawPrefix}${entityName}`
    );

    // Type guards
    code += `export function is${rawPrefix}${entityName}Like(subject: any): subject is ${rawPrefix}${entityName} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return true; }\n`;
    code += `  }\n`;
    code += `  return false;\n`;
    code += `}\n`;

    metaData.typeGuardFunctionNames.set(
      schemaAndTablePath,
      `is${rawPrefix}${entityName}`
    );
  }

  return code;
};
