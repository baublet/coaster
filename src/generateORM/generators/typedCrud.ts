import { MetaData, GeneratorResult } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { getSchemaAndTablePath } from "./helpers";
import { getExpectedTestValueForColumn } from "./helpers/getExpectedTestValueForColumn";

/**
 * Generates the lowest-level possible accessors and mutators for data in a
 * table.
 */
export const typedCrud = (
  schema: RawSchema,
  metaData: MetaData
): GeneratorResult => {
  metaData.setHeader(
    "knex",
    metaData.templateManager.render({ template: "rawBaseQuery/knex" })
  );

  let code = "";
  let testCode = "";

  for (const table of schema.tables) {
    const schemaAndTablePath = getSchemaAndTablePath(schema.name, table.name);
    const entityName = metaData.tableEntityNames.get(schemaAndTablePath);
    const pluralEntityName = generateNames(entityName).pluralPascal;
    const rawBaseQueryFunctionName =
      metaData.rawBaseQueryFunctionNames.get(schemaAndTablePath);
    const rawEntityTypeName =
      metaData.tableRawEntityNames.get(schemaAndTablePath);
    const rawToNamedFunctionName =
      metaData.transformerFunctionNames[rawEntityTypeName][entityName];
    const namedToRawFunctionName =
      metaData.transformerFunctionNames[entityName][rawEntityTypeName];
    const entityInputType =
      metaData.namedEntityInputTypeNames.get(schemaAndTablePath);

    const insertSingleFunctionName = `insert${entityName}`;
    const insertPluralFunctionName = `insert${pluralEntityName}`;
    const createMockEntityFunctionName =
      metaData.namedCreateTestEntityFunctionNames.get(`${schemaAndTablePath}`);

    // Create

    if (schema.flavor === "mysql") {
      code += metaData.templateManager.render({
        template: "typedCrud/insert.mysql",
        variables: {
          entityInputType,
          entityName,
          pluralEntityName,
          returnType: table.primaryKeyType,
          rawToNamedFunctionName,
          rawBaseQueryFunctionName,
          namedToRawFunctionName,
          insertPluralFunctionName,
          insertSingleFunctionName,
        },
      });
    } else {
      code += metaData.templateManager.render({
        template: "typedCrud/insert.pg",
        variables: {
          entityInputType,
          entityName,
          pluralEntityName,
          rawToNamedFunctionName,
          rawBaseQueryFunctionName,
          namedToRawFunctionName,
          insertPluralFunctionName,
          insertSingleFunctionName,
        },
      });
    }

    let expectedOutputShape = "expect.objectContaining({";
    for (const column of table.columns) {
      const columnPath = schemaAndTablePath + `.${column.name}`;
      const columnName = metaData.namedEntityColumnNames.get(columnPath);
      expectedOutputShape += `"${columnName}": ${getExpectedTestValueForColumn(
        column
      )},`;
    }
    expectedOutputShape += "})";

    const rawToPluralFunctionName =
      metaData.transformerFunctionNames[rawEntityTypeName][entityName];

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "typedCrud/insert.test.pg",
        variables: {
          codeOutputFullPath: metaData.codeOutputFullPath,
          entityName,
          expectedOutputShape,
          insertPluralFunctionName,
          insertSingleFunctionName,
          createMockEntityFunctionName,
        },
      });
    }

    // Read
    code += metaData.templateManager.render({
      template: "typedCrud/find",
      variables: {
        entityName,
        pluralEntityName,
        rawBaseQueryFunctionName,
        rawEntityTypeName,
        rawToNamedFunctionName,
      },
    });

    // Update
    const updateSingleFunctionName = `update${entityName}`;
    const updatePluralFunctionName = `update${entityName}Where`;

    code += metaData.templateManager.render({
      template: "typedCrud/update",
      variables: {
        entityInputType,
        namedToRawFunctionName,
        rawBaseQueryFunctionName,
        rawEntityTypeName,
        tablePrimaryKeyColumn: table.primaryKeyColumn,
        pluralEntityName,
        entityName,
        updatePluralFunctionName,
        updateSingleFunctionName,
        rawToPluralFunctionName,
      },
    });

    if (metaData.generateTestCode) {
      testCode += metaData.templateManager.render({
        template: "typedCrud/update.test",
        variables: {
          codeOutputFullPath: metaData.codeOutputFullPath,
          createMockEntityFunctionName,
          entityInputType,
          entityName,
          expectedOutputShape,
          insertSingleFunctionName,
          namedToRawFunctionName,
          pluralEntityName,
          rawBaseQueryFunctionName,
          rawEntityTypeName,
          rawToPluralFunctionName,
          updatePluralFunctionName,
          updateSingleFunctionName,
          tablePrimaryKeyColumn: table.primaryKeyColumn,
        },
      });
    }

    // Delete
    code += metaData.templateManager.render({
      template: "typedCrud/delete",
      variables: {
        entityName,
        rawBaseQueryFunctionName,
        rawEntityTypeName,
        tablePrimaryKeyColumn: table.primaryKeyColumn,
        pluralEntityName,
      },
    });
  }

  return {
    code,
    testCode,
  };
};
