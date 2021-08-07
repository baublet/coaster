import { camelCase } from "change-case";

import { MetaData, GetTypeName } from ".";
import { RawSchema } from "../drivers";

export const typesWithNamingPolicy = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    typesOrInterfaces: "types" | "interfaces";
    prefixSchemaName?: boolean;
    prefix?: string;
    getTypeName?: GetTypeName;
    getEntityName: (tableName: string, schemaName: string) => string;
    getPropertyName: (
      propertyName: string,
      tableName: string,
      schemaName: string
    ) => string;
  }
) => {
  let code = "";
  const prefix = options.prefix === undefined ? "" : options.prefix;

  for (const table of schema.tables) {
    const entityName = options.getEntityName(table.name, schema.name);
    const entityNameWithPrefix = prefix + entityName;

    const schemaAndTablePath = `${schema.name ? schema.name + "." : ""}${
      table.name
    }`;
    metaData.entityTableNames.set(entityNameWithPrefix, schemaAndTablePath);

    if (table.comment) {
      code += `\n/** ${table.comment} */\n`;
    }

    code += `export ${
      options.typesOrInterfaces === "interfaces" ? "interface" : "type"
    } ${entityNameWithPrefix} ${
      options.typesOrInterfaces === "interfaces" ? "" : "= "
    }{`;

    const requiredColumnNames: string[] = [];
    for (const column of table.columns) {
      const columnName = options.getPropertyName(
        column.name,
        table.name,
        schema.name
      );
      if (column.comment) {
        code += `\n/** ${column.comment} */`;
      }
      code += `\n${columnName}`;
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
        requiredColumnNames.push(columnName);
      }
    }

    code += `\n};\n`;

    const columnNamesAsJsonString = JSON.stringify(requiredColumnNames);
    // Type assertions
    code += `export function assertIs${entityNameWithPrefix}Like(subject: any): asserts subject is ${entityNameWithPrefix} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return; }\n`;
    code += `  }\n`;
    code += `  throw new Error("Invariance violation! Expected subject to be a ${entityNameWithPrefix}, but it was instead: " + JSON.stringify(subject));\n`;
    code += `}\n`;

    metaData.typeAssertionFunctionNames.set(
      schemaAndTablePath,
      `assertIs${prefix}${entityName}`
    );

    // Type guards
    code += `export function is${entityNameWithPrefix}Like(subject: any): subject is ${entityNameWithPrefix} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return true; }\n`;
    code += `  }\n`;
    code += `  return false;\n`;
    code += `}\n`;

    metaData.typeGuardFunctionNames.set(
      schemaAndTablePath,
      `is${entityNameWithPrefix}`
    );

    // Transformers
    const rawEntityName = metaData.tableEntityNames.get(schemaAndTablePath);
    const namedEntityName = entityNameWithPrefix;

    const rawToNamedFunctionName = camelCase(
      `${rawEntityName}To${namedEntityName}`
    );
    let rawToNamed = `export function ${rawToNamedFunctionName}`;
    rawToNamed += `(subject: ${rawEntityName}): ${namedEntityName} {\n`;
    rawToNamed += `  return {\n`;
    for (const column of table.columns) {
      const columnName = options.getPropertyName(
        column.name,
        table.name,
        schema.name
      );
      rawToNamed += `    ${columnName}: subject['${column.name}'],\n`;
    }
    rawToNamed += `  };\n`;
    rawToNamed += `}\n`;

    metaData.transformerFunctionNames[schemaAndTablePath] =
      metaData.transformerFunctionNames[schemaAndTablePath] || {};
    metaData.transformerFunctionNames[schemaAndTablePath][namedEntityName] =
      rawToNamedFunctionName;
    code += rawToNamed;
  }

  return code;
};
