import { camelCase } from "change-case";

import { orDefault, ternary } from "../../helpers";
import { MetaData, GetTypeName, GeneratorResult } from ".";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath, getName, getTypeName } from "./helpers";
import { generateNames } from "../../generateNames";

const defaultEntityNamingPolicy = (str: string) =>
  generateNames(str).singularPascal;
const defaultPropertyNamingPolicy = (str: string) =>
  generateNames(str).rawCamel;

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
): GeneratorResult => {
  let code = "";
  let testCode = "";
  const prefix = orDefault([options.prefix], "");

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
    const enumTypeName = `${prefix}${enumNames.singularPascal}${schemaName}${enumPrefix}`;
    code += `export type ${enumTypeName} = `;
    code += '"' + values.join('" | "') + '"';
    code += `;\n`;
    metaData.namedDatabaseEnumNames.set(`${schema.name}.${name}`, enumTypeName);
  }

  // Entities
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

      code += getTypeName({
        column,
        metaData,
        schema,
        table,
        getTypeName: options.getTypeName,
        rawOrNamed: "named",
      });

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

    if (metaData.generateTestCode) {
      const functionName = `assertIs${entityNameWithPrefix}Like`;
      testCode += `\n\nimport { ${functionName}, ${entityNameWithPrefix} } from "${
        metaData.codeOutputFullPath
      }";

describe("assertIs${entityNameWithPrefix}Like", () => {
  it("throws if input is not like a ${entityNameWithPrefix}", () => {
    expect(() => ${functionName}(1)).toThrow();
    expect(() => ${functionName}([])).toThrow();
    expect(() => ${functionName}(false)).toThrow();
    expect(() => ${functionName}({})).toThrow();
  })
  it("does not throw and asserts properly if input is like a ${entityNameWithPrefix}", () => {
    const ${entityNameWithPrefix}Like = {
      ${requiredColumnNames.map((col) => `${col}: ""`).join(",")}
    } as unknown;
    expect(() => ${functionName}(${entityNameWithPrefix}Like)).not.toThrow();

    // We expect no TS error here
    ${functionName}(${entityNameWithPrefix}Like);
    const actualEntityType: ${entityNameWithPrefix} = ${entityNameWithPrefix}Like;
    expect(actualEntityType).toEqual(${entityNameWithPrefix}Like);
  })
})
`;
    }

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

    if (metaData.generateTestCode) {
      const functionName = `is${entityNameWithPrefix}Like`;

      testCode += `\n\nimport { ${functionName} } from "${
        metaData.codeOutputFullPath
      }";

describe("${functionName}", () => {
  it("returns false if input is not like a ${entityNameWithPrefix}", () => {
    expect(${functionName}(1)).toBe(false);
    expect(${functionName}([])).toBe(false);
    expect(${functionName}(false)).toBe(false);
    expect(${functionName}({})).toBe(false);
  })
  it("returns true and asserts properly if input is like a ${entityNameWithPrefix}", () => {
    const ${entityNameWithPrefix}Like = {
      ${requiredColumnNames.map((col) => `${col}: ""`).join(",")}
    } as unknown;
    expect(${functionName}(${entityNameWithPrefix}Like)).toBe(true);
    
    if (${functionName}(${entityNameWithPrefix}Like)) {
      // We expect no TS error here
      const actualEntityType: ${entityNameWithPrefix} = ${entityNameWithPrefix}Like;
      expect(actualEntityType).toEqual(${entityNameWithPrefix}Like);
    } else {
      // @ts-expect-error
      const actualEntityType: ${entityNameWithPrefix} = ${entityNameWithPrefix}Like;
      expect(actualEntityType).toEqual(${entityNameWithPrefix}Like);
    }
  })
})
`;
    }

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

    if (metaData.generateTestCode) {
      testCode += `\n\nimport { ${rawToNamedFunctionName} } from "${
        metaData.codeOutputFullPath
      }";

describe("${rawToNamedFunctionName}", () => {
  const ${rawEntityName}Full: ${rawEntityName} = {
    ${Object.values(table.columns)
      .map((col) => `${col.name}: "" as any`)
      .join(",")}
  };
  const ${namedEntityName}Full: ${namedEntityName} = {
    ${Object.values(table.columns)
      .map(
        (col) =>
          `${metaData.namedEntityColumnNames.get(
            `${schemaAndTablePath}.${col.name}`
          )}: "" as any`
      )
      .join(",")}
  };
  const ${rawEntityName}Partial: Partial<${rawEntityName}> = {};
  const ${namedEntityName}Partial: Partial<${namedEntityName}> = {};
  it("converts a full ${rawEntityName} to a full ${namedEntityName}", () => {
    expect(${rawToNamedFunctionName}(${rawEntityName}Full)).toEqual(${namedEntityName}Full);
  });
  it("converts a partial ${rawEntityName} to a partial ${namedEntityName}", () => {
    expect(${rawToNamedFunctionName}(${rawEntityName}Partial)).toEqual(${namedEntityName}Partial);
  });
});`;
    }

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

    if (metaData.generateTestCode) {
      testCode += `\n\nimport { ${namedToRawFunctionName} } from "${
        metaData.codeOutputFullPath
      }";
  
describe("${namedToRawFunctionName}", () => {
  const ${namedEntityName}Full: ${namedEntityName} = {
    ${Object.values(table.columns)
      .map(
        (col) =>
          `${metaData.namedEntityColumnNames.get(
            `${schemaAndTablePath}.${col.name}`
          )}: "" as any`
      )
      .join(",")}
  };
  const ${rawEntityName}Full: ${rawEntityName} = {
    ${Object.values(table.columns)
      .map((col) => `${col.name}: "" as any`)
      .join(",")}
  };
  const ${rawEntityName}Partial: Partial<${rawEntityName}> = {};
  const ${namedEntityName}Partial: Partial<${namedEntityName}> = {};
  it("converts a full ${namedEntityName} to a full ${rawEntityName}", () => {
    expect(${namedToRawFunctionName}(${namedEntityName}Full)).toEqual(${rawEntityName}Full);
  });
  it("converts a partial ${namedEntityName} to a partial ${rawEntityName}", () => {
    expect(${namedToRawFunctionName}(${namedEntityName}Partial)).toEqual(${rawEntityName}Partial);
  });
});`;
    }

    // Named input type -- all nullable and non-nullable fields with defaults
    // are optional
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

      code += getTypeName({
        column,
        metaData,
        schema,
        table,
        getTypeName: options.getTypeName,
        rawOrNamed: "named",
      });

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

  return {
    code,
    testCode,
  };
};
