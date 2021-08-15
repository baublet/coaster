import { MetaData, GetTypeName } from ".";
import { RawSchema } from "../drivers";
import { getName, getSchemaAndTablePath } from "./helpers";
import { generateNames } from "../../generateNames";
import { orDefault } from "../../helpers";

/**
 * Creates types, guards, and assertions for the shape of data coming out of
 * and going into the database.
 */
export const rawTypes = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    typesOrInterfaces: "types" | "interfaces";
    enumPrefix?: string;
    prefixSchemaName?: boolean;
    rawPrefix?: string;
    getTypeName?: GetTypeName;
  } = {
    enumPrefix: "Enum",
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
  metaData.setHeader(
    "json-type",
    `type AnyJson =  boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap {  [key: string]: AnyJson; }
interface JsonArray extends Array<AnyJson> {}
  `
  );

  let code = "";
  const rawPrefix = options.rawPrefix === undefined ? "Raw" : options.rawPrefix;

  // Enums
  const schemaName = options.prefixSchemaName
    ? generateNames(
        getName(undefined, undefined, schema.name, options.prefixSchemaName)
      ).singularPascal
    : "";
  const enumPrefix = orDefault([options.enumPrefix], "Enum");
  for (const { name, values } of schema.enums) {
    const enumNames = generateNames(name);
    const enumTypeName = `${rawPrefix}${enumNames.singularPascal}${schemaName}${enumPrefix}`;
    code += `export type ${enumTypeName} = `;
    code += '"' + values.join('" | "') + '"';
    code += `;\n`;
    metaData.rawDatabaseEnumNames.set(`${schema.name}.${name}`, enumTypeName);
  }

  // Entities
  for (const table of schema.tables) {
    const entityName = getName(
      undefined,
      table.name,
      schema.name,
      options.prefixSchemaName
    );

    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    metaData.tableRawEntityNames.set(
      schemaAndTablePath,
      rawPrefix + entityName
    );
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

      if (column.type === "enum") {
        const userDeclaredColumnTypeName = options.getTypeName?.(
          column.type,
          column.name,
          table.name,
          schema.name
        );
        if (
          userDeclaredColumnTypeName ||
          (userDeclaredColumnTypeName &&
            !metaData.rawDatabaseEnumNames.has(column.enumPath))
        ) {
          code += userDeclaredColumnTypeName;
        } else if (metaData.rawDatabaseEnumNames.has(column.enumPath)) {
          code += metaData.rawDatabaseEnumNames.get(column.enumPath);
        } else {
          code += "string";
        }
      } else {
        code +=
          options.getTypeName?.(
            column.type,
            column.name,
            table.name,
            schema.name
          ) || column.type;
      }

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
