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
    const prefixedEntityName = prefix + entityName;

    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    metaData.entityTableNames.set(prefixedEntityName, schemaAndTablePath);
    metaData.tableEntityNames.set(schemaAndTablePath, prefixedEntityName);

    const requiredColumnNames: string[] = [];

    let columnsCode = "";
    for (const column of table.columns) {
      const columnName = options.getPropertyName(
        column.name,
        table.name,
        schema.name
      );

      columnsCode += metaData.templateManager.render({
        template: "typesWithNamingPolicy/entityProperty",
        variables: {
          columnName,
          columnTypeName: getTypeName({
            column,
            metaData,
            schema,
            table,
            getTypeName: options.getTypeName,
            rawOrNamed: "named",
          }),
          comment: column.comment ? `\n/** ${column.comment} */` : "",
          propertyNameTerminator: column.nullable ? "?: " : ": ",
        },
      });

      if (!column.nullable) {
        requiredColumnNames.push(columnName);
      }
    }

    code += metaData.templateManager.render({
      template: "typesWithNamingPolicy/entity",
      variables: {
        columns: columnsCode,
        comment: table.comment ? `/** ${table.comment} */` : "",
        entityName: prefixedEntityName,
        interfaceOrType:
          options.typesOrInterfaces === "interfaces" ? "interface" : "type",
        typeEqualsSign: options.typesOrInterfaces === "interfaces" ? "" : "= ",
      },
    });

    const columnNamesAsJsonString = JSON.stringify(requiredColumnNames);

    // Type assertions
    const assertionFunctionName = `assertIs${prefix}${entityName}Like`;
    code += metaData.templateManager.render({
      template: "typesWithNamingPolicy/typeAssertion",
      variables: {
        assertionFunctionName,
        prefixedEntityName,
        columnNamesAsJsonString,
      },
    });

    metaData.typeAssertionFunctionNames.set(
      schemaAndTablePath,
      assertionFunctionName
    );

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "typesWithNamingPolicy/typeAssertion.test",
        variables: {
          assertionFunctionName,
          codeOutputFullPath: metaData.codeOutputFullPath,
          entityLikeAsJsonString: `{${requiredColumnNames
            .map((col) => `${col}: ""`)
            .join(",")}}`,
          prefixedEntityName,
        },
      });
    }

    // Type guards
    const typeGuardFunctionName = `is${prefixedEntityName}Like`;

    code += metaData.templateManager.render({
      template: "typesWithNamingPolicy/typeGuard",
      variables: {
        columnNamesAsJsonString,
        prefixedEntityName,
        typeGuardFunctionName,
      },
    });

    metaData.typeGuardFunctionNames.set(
      schemaAndTablePath,
      typeGuardFunctionName
    );

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "typesWithNamingPolicy/typeGuard.test",
        variables: {
          codeOutputFullPath: metaData.codeOutputFullPath,
          entityLikeAsJsonString: `{${requiredColumnNames
            .map((col) => `${col}: ""`)
            .join(",")}}`,
          typeGuardFunctionName,
          prefixedEntityName,
        },
      });
    }

    // Transformers
    const rawEntityName = metaData.tableRawEntityNames.get(schemaAndTablePath);
    const namedEntityName = prefixedEntityName;

    // Raw to named
    const rawToNamedFunctionName = camelCase(
      `${rawEntityName}To${namedEntityName}`
    );

    const rawToNamedPropertyAssignments = table.columns
      .map((column) => {
        const namedColumnName = options.getPropertyName(
          column.name,
          table.name,
          schema.name
        );

        metaData.namedEntityColumnNames.set(
          `${schemaAndTablePath}.${column.name}`,
          namedColumnName
        );

        return metaData.templateManager.render({
          template: "typesWithNamingPolicy/rawToNamedAssignment",
          variables: {
            namedColumnName: namedColumnName,
            rawColumnName: column.name,
          },
        });
      })
      .join("");

    code += metaData.templateManager.render({
      template: "typesWithNamingPolicy/rawToNamed",
      variables: {
        rawEntityName,
        rawToNamedFunctionName,
        rawToNamedPropertyAssignments,
        rawToNamedReturnTypeSignature: `T extends ${rawEntityName} ? ${namedEntityName} : Partial<${namedEntityName}>`,
      },
    });

    metaData.transformerFunctionNames[rawEntityName] =
      metaData.transformerFunctionNames[rawEntityName] || {};
    metaData.transformerFunctionNames[rawEntityName][namedEntityName] =
      rawToNamedFunctionName;

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "typesWithNamingPolicy/rawToNamed.test",
        variables: {
          codeOutputFullPath: metaData.codeOutputFullPath,
          namedEntityName,
          namedFullTestSubject: `{${Object.values(table.columns)
            .map(
              (col) =>
                `${metaData.namedEntityColumnNames.get(
                  `${schemaAndTablePath}.${col.name}`
                )}: "" as any`
            )
            .join(",")}}`,
          rawEntityName,
          rawFullTestSubject: `{${Object.values(table.columns)
            .map((col) => `${col.name}: "" as any`)
            .join(",")}}`,
          rawToNamedFunctionName,
        },
      });
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
    } ${prefixedEntityName}Input ${
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
        `${prefixedEntityName}Input`
      );
    }
    code += `\n}\n\n`;
  }

  return {
    code,
    testCode,
  };
};
