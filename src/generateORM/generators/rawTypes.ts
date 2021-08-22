import { MetaData, GetTypeName, GeneratorResult } from ".";
import { RawSchema } from "../drivers";
import {
  getDefaultJavascriptForColumnType,
  getName,
  getSchemaAndTablePath,
  getTypeName,
} from "./helpers";
import { generateNames } from "../../generateNames";
import { orDefault, ternary } from "../../helpers";

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
): GeneratorResult => {
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
    `export type AnyJson =  boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap {  [key: string]: AnyJson; };
export interface JsonArray extends Array<AnyJson> {};`
  );

  let code = "";
  let testCode = "";
  const rawPrefix = options.rawPrefix === undefined ? "Raw" : options.rawPrefix;

  // Enums
  const schemaName = ternary(
    options.prefixSchemaName,
    generateNames(
      getName(undefined, undefined, schema.name, options.prefixSchemaName)
    ).singularPascal,
    ""
  );
  const enumPrefix = orDefault([options.enumPrefix], "Enum");
  for (const { name, values } of schema.enums) {
    const enumNames = generateNames(name);
    const enumTypeName = `${rawPrefix}${enumNames.singularPascal}${schemaName}${enumPrefix}`;
    code += `export type ${enumTypeName} = `;
    code += '"' + values.join('" | "') + '"';
    code += `;\n`;
    metaData.rawDatabaseEnumNames.set(`${schema.name}.${name}`, enumTypeName);
    metaData.rawEnumValues.set(`${schema.name}.${name}`, values);
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

      code += getTypeName({
        column,
        metaData,
        schema,
        table,
        getTypeName: options.getTypeName,
        rawOrNamed: "raw",
      });

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

    if (metaData.generateTestCode) {
      testCode += `\n\nimport { assertIs${rawPrefix}${entityName}Like, ${rawPrefix}${entityName} } from "${
        metaData.codeOutputFullPath
      }";

describe("assertIs${rawPrefix}${entityName}Like", () => {
  it("throws if input is not like a ${rawPrefix}${entityName}", () => {
    expect(() => assertIs${rawPrefix}${entityName}Like(1)).toThrow();
    expect(() => assertIs${rawPrefix}${entityName}Like([])).toThrow();
    expect(() => assertIs${rawPrefix}${entityName}Like(false)).toThrow();
    expect(() => assertIs${rawPrefix}${entityName}Like({})).toThrow();
  });
  it("does not throw and asserts properly if input is like a ${rawPrefix}${entityName}", () => {
    const ${rawPrefix}${entityName}Like = {
      ${rawRequiredColumnNames.map((col) => `${col}: ""`).join(",\n      ")}
    } as unknown;
    expect(() => assertIs${rawPrefix}${entityName}Like(${rawPrefix}${entityName}Like)).not.toThrow();

    // We expect no TS error here
    assertIs${rawPrefix}${entityName}Like(${rawPrefix}${entityName}Like)
    const actualEntityType: ${rawPrefix}${entityName} = ${rawPrefix}${entityName}Like;
    expect(actualEntityType).toEqual(${rawPrefix}${entityName}Like);
  });
});
`;
    }

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

    if (metaData.generateTestCode) {
      testCode += `\n\nimport { is${rawPrefix}${entityName}Like } from "${
        metaData.codeOutputFullPath
      }";

describe("is${rawPrefix}${entityName}Like", () => {
  it("returns false if input is not like a ${rawPrefix}${entityName}", () => {
    expect(is${rawPrefix}${entityName}Like(1)).toBe(false);
    expect(is${rawPrefix}${entityName}Like([])).toBe(false);
    expect(is${rawPrefix}${entityName}Like(false)).toBe(false);
    expect(is${rawPrefix}${entityName}Like({})).toBe(false);
  });
  it("returns true and asserts properly if input is like a ${rawPrefix}${entityName}", () => {
    const ${rawPrefix}${entityName}Like = {
      ${rawRequiredColumnNames.map((col) => `${col}: ""`).join(",\n      ")}
    } as unknown;
    expect(is${rawPrefix}${entityName}Like(${rawPrefix}${entityName}Like)).toBe(true);
    
    if (is${rawPrefix}${entityName}Like(${rawPrefix}${entityName}Like)) {
      // We expect no TS error here
      const actualEntityType: ${rawPrefix}${entityName} = ${rawPrefix}${entityName}Like;
      expect(actualEntityType).toEqual(${rawPrefix}${entityName}Like);
    } else {
      // @ts-expect-error
      const actualEntityType: ${rawPrefix}${entityName} = ${rawPrefix}${entityName}Like;
      expect(actualEntityType).toEqual(${rawPrefix}${entityName}Like);
    }
  });
});
`;
    }

    // Test Fixtures
    if (metaData.generateTestCode) {
      const functionName = `createMock${rawPrefix}${entityName}`;
      testCode += `\n\nfunction ${functionName}(defaults: Partial<${rawPrefix}${entityName}> = {}): ${rawPrefix}${entityName} {
  const test${rawPrefix}${entityName}: ${rawPrefix}${entityName} = {
    ${table.columns
      .map(
        (col) =>
          `${col.name}: ${getDefaultJavascriptForColumnType(col, metaData)}`
      )
      .join(",\n    ")},
    ...defaults
  }
  return test${rawPrefix}${entityName};
}`;
    }
  }

  return {
    code,
    testCode,
  };
};
