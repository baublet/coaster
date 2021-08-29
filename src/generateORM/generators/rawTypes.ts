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
      template: "rawTypes/enum",
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
        template: "rawTypes/entityProperty",
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
      template: "rawTypes/entity",
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
    const assertionFunctionName = `assertIs${prefixedEntityName}Like`;
    code += metaData.templateManager.render({
      template: "rawTypes/assertIsEntityLike",
      variables: {
        columnNamesAsJsonString,
        prefixedEntityName,
        functionName: assertionFunctionName,
      },
    });

    metaData.typeAssertionFunctionNames.set(
      schemaAndTablePath,
      assertionFunctionName
    );

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "rawTypes/assertIsEntityLike.test",
        variables: {
          codeOutputFullPath: metaData.codeOutputFullPath,
          functionName: assertionFunctionName,
          prefixedEntityName,
          requiredColumns: rawRequiredColumnNames
            .map((col) => `${col}: ""`)
            .join(",\n      "),
        },
      });
    }

    // Type guards
    const guardFunctionName = `is${prefixedEntityName}Like`;
    code += metaData.templateManager.render({
      template: "rawTypes/isEntityLike",
      variables: {
        codeOutputFullPath: metaData.codeOutputFullPath,
        functionName: guardFunctionName,
        prefixedEntityName,
        requiredColumns: columnNamesAsJsonString,
      },
    });

    metaData.typeGuardFunctionNames.set(
      schemaAndTablePath,
      `is${prefixedEntityName}`
    );

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "rawTypes/isEntityLike.test",
        variables: {
          codeOutputFullPath: metaData.codeOutputFullPath,
          functionName: guardFunctionName,
          prefixedEntityName,
          requiredColumns: rawRequiredColumnNames
            .map((col) => `${col}: ""`)
            .join(",\n      "),
        },
      });
    }

    // Test Fixtures
    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "rawTypes/createMockEntity",
        variables: {
          functionName: `createMock${prefixedEntityName}`,
          prefixedEntityName,
          columnDefaults: table.columns
            .map(
              (col) =>
                `${col.name}: ${getDefaultJavascriptForColumnType(
                  col,
                  metaData
                )}`
            )
            .join(",\n    "),
        },
      });
    }
  }

  return {
    code,
    testCode,
  };
};
