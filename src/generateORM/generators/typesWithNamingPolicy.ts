import { camelCase, pascalCase } from "change-case";
import { orDefault } from "../../helpers";

import { MetaData, GetTypeName } from ".";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath, getName } from "./helpers";
import { generateNames } from "../../generateNames";

const defaultEntityNamingPolicy = (str: string) => pascalCase(str);
const defaultPropertyNamingPolicy = (str: string) => camelCase(str);

/**
 * JS code often has different name conventions than database names (e.g., your
 * database might use snake_case, but your JS code might use camelCase). This
 * generator creates types, assertions, guards, and transformers to transform
 * raw DB types to any custom type structure and back again.
 */
export const typesWithNamingPolicy = (
  schema: RawSchema,
  metaData: MetaData,
  options: {
    enumPrefix?: string;
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
  } = {
    enumPrefix: "Enum",
    typesOrInterfaces: "interfaces",
    getEntityName: defaultEntityNamingPolicy,
    getPropertyName: defaultPropertyNamingPolicy,
  }
) => {
  let code = "";
  const prefix = orDefault([options.prefix], "");

  for (const table of schema.tables) {
    const entityName = options.getEntityName(table.name, schema.name);
    const entityNameWithPrefix = prefix + entityName;

    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    metaData.entityTableNames.set(entityNameWithPrefix, schemaAndTablePath);
    metaData.tableEntityNames.set(schemaAndTablePath, entityNameWithPrefix);

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
      code += orDefault(
        [
          options.getTypeName?.(
            column.type,
            column.name,
            table.name,
            schema.name
          ),
        ],
        column.type
      );
      code += ";";
      if (!column.nullable) {
        requiredColumnNames.push(columnName);
      }
    }

    code += `\n};\n\n`;

    const columnNamesAsJsonString = JSON.stringify(requiredColumnNames);

    // Type assertions
    code += `export function assertIs${entityNameWithPrefix}Like(subject: any): asserts subject is ${entityNameWithPrefix} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return; }\n`;
    code += `  }\n`;
    code += `  throw new Error("Invariance violation! Expected subject to be a ${entityNameWithPrefix}, but it was instead: " + JSON.stringify(subject));\n`;
    code += `}\n\n`;

    metaData.typeAssertionFunctionNames.set(
      schemaAndTablePath,
      `assertIs${prefix}${entityName}Like`
    );

    // Type guards
    code += `export function is${entityNameWithPrefix}Like(subject: any): subject is ${entityNameWithPrefix} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return true; }\n`;
    code += `  }\n`;
    code += `  return false;\n`;
    code += `}\n\n`;

    metaData.typeGuardFunctionNames.set(
      schemaAndTablePath,
      `is${entityNameWithPrefix}Like`
    );

    // Transformers
    const rawEntityName = metaData.tableRawEntityNames.get(schemaAndTablePath);
    const namedEntityName = entityNameWithPrefix;

    // Raw to named
    const rawToNamedFunctionName = camelCase(
      `${rawEntityName}To${namedEntityName}`
    );

    const rawToNamedReturnTypeSignature = `T extends ${rawEntityName} ? ${namedEntityName} : Partial<${namedEntityName}>`;
    code += `export function ${rawToNamedFunctionName}`;
    code += `<T extends ${rawEntityName} | Partial<${rawEntityName}>>(subject: T): ${rawToNamedReturnTypeSignature} {\n`;
    code += `  const namedSubject: Record<string, any> = {};\n`;
    for (const column of table.columns) {
      const columnName = options.getPropertyName(
        column.name,
        table.name,
        schema.name
      );
      code += `    if(subject["${column.name}"] !== undefined) namedSubject["${columnName}"] = subject["${column.name}"];\n`;

      metaData.namedEntityColumnNames.set(
        `${schemaAndTablePath}.${column.name}`,
        columnName
      );
    }
    code += `  return namedSubject as ${rawToNamedReturnTypeSignature};\n`;
    code += `}\n\n`;

    metaData.transformerFunctionNames[rawEntityName] =
      metaData.transformerFunctionNames[rawEntityName] || {};
    metaData.transformerFunctionNames[rawEntityName][namedEntityName] =
      rawToNamedFunctionName;

    // Named to raw
    const namedToRawFunctionName = camelCase(
      `${namedEntityName}To${rawEntityName}`
    );

    const namedToRawReturnTypeSignature = `T extends ${entityName} ? ${rawEntityName} : Partial<${rawEntityName}>`;
    code += `export function ${namedToRawFunctionName}`;
    code += `<T extends ${namedEntityName} | Partial<${namedEntityName}>>(subject: T): ${namedToRawReturnTypeSignature} {\n`;
    code += `  const rawSubject: Record<string, any> = {};\n`;
    for (const column of table.columns) {
      const columnName = options.getPropertyName(
        column.name,
        table.name,
        schema.name
      );
      code += `    if(subject["${columnName}"] !== undefined) rawSubject["${column.name}"] = subject["${columnName}"];\n`;
    }
    code += `  return rawSubject as ${namedToRawReturnTypeSignature};\n`;
    code += `}\n\n`;

    metaData.transformerFunctionNames[namedEntityName] =
      metaData.transformerFunctionNames[namedEntityName] || {};
    metaData.transformerFunctionNames[namedEntityName][rawEntityName] =
      namedToRawFunctionName;

    // Named input type -- all nullable and non-nullable fields with defaults
    // are partial
    code += `export ${
      options.typesOrInterfaces === "interfaces" ? "interface" : "type"
    } ${entityNameWithPrefix}Input ${
      options.typesOrInterfaces === "interfaces" ? "" : "= "
    }{`;
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
      code +=
        column.nullable === true || column.hasDefault === true ? "?: " : ": ";
      code += orDefault(
        [
          options.getTypeName?.(
            column.type,
            column.name,
            table.name,
            schema.name
          ),
        ],
        column.type
      );
      code += ";";
      if (!column.nullable) {
        requiredColumnNames.push(columnName);
      }
      metaData.namedEntityInputTypeNames.set(
        schemaAndTablePath,
        `${entityNameWithPrefix}Input`
      );
    }
    code += `\n}\n\n`;
  }

  const schemaName = options.prefixSchemaName
    ? generateNames(
        getName(undefined, undefined, schema.name, options.prefixSchemaName)
      ).singularPascal
    : "";
  const enumPrefix = orDefault([options.enumPrefix], "Enum");
  for (const { name, values } of schema.enums) {
    const enumNames = generateNames(name);
    const enumTypeName = `${prefix}${enumNames.singularPascal}${schemaName}${enumPrefix}`;
    code += `export type ${enumTypeName} = `;
    code += '"' + values.join('" | "') + '"';
    code += `;\n`;
    metaData.namedDatabaseEnumNames.set(`${schema.name}.${name}`, enumTypeName);
  }

  return code;
};
