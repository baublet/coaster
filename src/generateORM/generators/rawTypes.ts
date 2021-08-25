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
    metaData.templateManager.render({
      template: "rawBaseQuery/objectHasProperties",
    })
  );
  metaData.setHeader(
    "json-type",
    metaData.templateManager.render({ template: "rawBaseQuery/jsonType" })
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
    code += metaData.templateManager.render({
      template: "rawBaseQuery/enum",
      variables: {
        enumTypeName,
        values: '"' + values.join('" | "') + '"',
      },
    });
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
    const prefixedEntityName = rawPrefix + entityName;

    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    metaData.tableRawEntityNames.set(schemaAndTablePath, prefixedEntityName);
    metaData.entityTableNames.set(prefixedEntityName, schemaAndTablePath);

    const rawRequiredColumnNames: string[] = [];
    let columnsCode = "";
    for (const column of table.columns) {
      columnsCode += metaData.templateManager.render({
        template: "rawBaseQuery/entityProperty",
        variables: {
          columnName: column.name,
          propertyNameTerminator: column.nullable ? "?: " : ": ",
          columnTypeName: getTypeName({
            column,
            metaData,
            schema,
            table,
            getTypeName: options.getTypeName,
            rawOrNamed: "raw",
          }),
          comment: column.comment ? `/** ${column.comment} */` : "",
        },
      });
      if (!column.nullable) {
        rawRequiredColumnNames.push(column.name);
      }
    }

    code += metaData.templateManager.render({
      template: "rawBaseQuery/entity",
      variables: {
        columns: columnsCode,
        comment: table.comment ? `/** ${table.comment} */` : "",
        entityName: prefixedEntityName,
        interfaceOrType:
          options.typesOrInterfaces === "interfaces" ? "interface" : "type",
        typeEqualsSign: options.typesOrInterfaces === "interfaces" ? "" : "= ",
      },
    });

    const columnNamesAsJsonString = JSON.stringify(rawRequiredColumnNames);
    // Type assertions
    code += `export function assertIs${prefixedEntityName}Like(subject: any): asserts subject is ${prefixedEntityName} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return; }\n`;
    code += `  }\n`;
    code += `  throw new Error("Invariance violation! Expected subject to be a ${prefixedEntityName}, but it was instead: " + JSON.stringify(subject));\n`;
    code += `}\n`;

    metaData.typeAssertionFunctionNames.set(
      schemaAndTablePath,
      `assertIs${prefixedEntityName}`
    );

    if (metaData.generateTestCode) {
      testCode += `\n\nimport { assertIs${prefixedEntityName}Like, ${prefixedEntityName} } from "${
        metaData.codeOutputFullPath
      }";

describe("assertIs${prefixedEntityName}Like", () => {
  it("throws if input is not like a ${prefixedEntityName}", () => {
    expect(() => assertIs${prefixedEntityName}Like(1)).toThrow();
    expect(() => assertIs${prefixedEntityName}Like([])).toThrow();
    expect(() => assertIs${prefixedEntityName}Like(false)).toThrow();
    expect(() => assertIs${prefixedEntityName}Like({})).toThrow();
  });
  it("does not throw and asserts properly if input is like a ${prefixedEntityName}", () => {
    const ${prefixedEntityName}Like = {
      ${rawRequiredColumnNames.map((col) => `${col}: ""`).join(",\n      ")}
    } as unknown;
    expect(() => assertIs${prefixedEntityName}Like(${prefixedEntityName}Like)).not.toThrow();

    // We expect no TS error here
    assertIs${prefixedEntityName}Like(${prefixedEntityName}Like)
    const actualEntityType: ${prefixedEntityName} = ${prefixedEntityName}Like;
    expect(actualEntityType).toEqual(${prefixedEntityName}Like);
  });
});
`;
    }

    // Type guards
    code += `export function is${prefixedEntityName}Like(subject: any): subject is ${prefixedEntityName} {\n`;
    code += `  if(typeof subject === "object") {\n`;
    code += `    if(objectHasProperties(subject, ${columnNamesAsJsonString})) { return true; }\n`;
    code += `  }\n`;
    code += `  return false;\n`;
    code += `}\n`;

    metaData.typeGuardFunctionNames.set(
      schemaAndTablePath,
      `is${prefixedEntityName}`
    );

    if (metaData.generateTestCode) {
      testCode += `\n\nimport { is${prefixedEntityName}Like } from "${
        metaData.codeOutputFullPath
      }";

describe("is${prefixedEntityName}Like", () => {
  it("returns false if input is not like a ${prefixedEntityName}", () => {
    expect(is${prefixedEntityName}Like(1)).toBe(false);
    expect(is${prefixedEntityName}Like([])).toBe(false);
    expect(is${prefixedEntityName}Like(false)).toBe(false);
    expect(is${prefixedEntityName}Like({})).toBe(false);
  });
  it("returns true and asserts properly if input is like a ${prefixedEntityName}", () => {
    const ${prefixedEntityName}Like = {
      ${rawRequiredColumnNames.map((col) => `${col}: ""`).join(",\n      ")}
    } as unknown;
    expect(is${prefixedEntityName}Like(${prefixedEntityName}Like)).toBe(true);
    
    if (is${prefixedEntityName}Like(${prefixedEntityName}Like)) {
      // We expect no TS error here
      const actualEntityType: ${prefixedEntityName} = ${prefixedEntityName}Like;
      expect(actualEntityType).toEqual(${prefixedEntityName}Like);
    } else {
      // @ts-expect-error
      const actualEntityType: ${prefixedEntityName} = ${prefixedEntityName}Like;
      expect(actualEntityType).toEqual(${prefixedEntityName}Like);
    }
  });
});
`;
    }

    // Test Fixtures
    if (metaData.generateTestCode) {
      const functionName = `createMock${prefixedEntityName}`;
      testCode += `\n\nfunction ${functionName}(defaults: Partial<${prefixedEntityName}> = {}): ${prefixedEntityName} {
  const test${prefixedEntityName}: ${prefixedEntityName} = {
    ${table.columns
      .map(
        (col) =>
          `${col.name}: ${getDefaultJavascriptForColumnType(col, metaData)}`
      )
      .join(",\n    ")},
    ...defaults
  }
  return test${prefixedEntityName};
}`;
    }
  }

  return {
    code,
    testCode,
  };
};
