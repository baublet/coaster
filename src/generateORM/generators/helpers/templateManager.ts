import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

export function getTemplateManager() {
  return getManager({
    "rawBaseQuery/query.test": [
      "pluralEntityName",
      "codeOutputFullPath",
      "testConnectionVariable",
    ] as const,
    "rawBaseQuery/query": [
      "pluralEntityName",
      "entityName",
      "tableName",
    ] as const,
    "rawBaseQuery/knex": [] as const,
    "rawBaseQuery/objectHasProperties": [] as const,
    "rawBaseQuery/jsonType": [] as const,
    "rawTypes/assertIsEntityLike": [
      "prefixedEntityName",
      "functionName",
      "columnNamesAsJsonString",
    ] as const,
    "rawTypes/assertIsEntityLike.test": [
      "functionName",
      "prefixedEntityName",
      "codeOutputFullPath",
      "requiredColumns",
    ] as const,
    "rawTypes/createMockEntity": [
      "functionName",
      "prefixedEntityName",
      "columnDefaults",
    ] as const,
    "rawTypes/enum": ["enumTypeName", "values"] as const,
    "rawTypes/entity": [
      "comment",
      "interfaceOrType",
      "entityName",
      "typeEqualsSign",
      "columns",
    ] as const,
    "rawTypes/entityProperty": [
      "comment",
      "columnName",
      "propertyNameTerminator",
      "columnTypeName",
    ] as const,
    "rawTypes/isEntityLike": [
      "functionName",
      "prefixedEntityName",
      "codeOutputFullPath",
      "requiredColumns",
      "columnNamesAsJsonString",
    ] as const,
    "rawTypes/isEntityLike.test": [
      "functionName",
      "codeOutputFullPath",
      "requiredColumns",
      "prefixedEntityName",
    ] as const,
    "typedCrud/insert.pg": [
      "entityName",
      "entityInputType",
      "entityName",
      "rawToNamedFunctionName",
      "pluralEntityName",
      "rawBaseQueryFunctionName",
    ] as const,
    "typedCrud/insert.mysql": [
      "entityName",
      "entityInputType",
      "entityName",
      "rawToNamedFunctionName",
      "pluralEntityName",
      "returnType",
      "rawBaseQueryFunctionName",
    ] as const,
    "typedCrud/find": [
      "pluralEntityName",
      "rawEntityTypeName",
      "entityName",
      "rawBaseQueryFunctionName",
      "rawToNamedFunctionName",
    ] as const,
    "typedCrud/update": [
      "entityName",
      "entityInputType",
      "namedToRawFunctionName",
      "rawBaseQueryFunctionName",
      "tablePrimaryKeyColumn",
      "rawEntityTypeName",
      "pluralEntityName",
    ] as const,
    "typedCrud/delete": [
      "entityName",
      "rawBaseQueryFunctionName",
      "tablePrimaryKeyColumn",
      "rawEntityTypeName",
      "rawBaseQueryFunctionName",
      "pluralEntityName",
    ] as const,
  });
}

const templatesPath = path.resolve(__dirname, "templates");

mkdirp.sync(templatesPath);

export interface TemplateManager<T extends Record<string, Template>> {
  render: (
    args: {
      [K in keyof T]: {
        template: K;
        variables?: { [key in T[K][number]]: string | number };
      };
    }[keyof T]
  ) => string;
}

type Template = readonly string[];

function getPathToTemplate(key: string): string {
  return path.resolve(templatesPath, `${key}.tpl.ts`);
}

function getManager<T extends Record<string, Template>>(
  templates: T
): TemplateManager<T> {
  const templateTransformers = new Map<
    string,
    (args?: Record<string, any>) => string
  >();
  const regexList: Record<string, RegExp> = {};

  for (const key of Object.keys(templates)) {
    for (const variableKey of templates[key]) {
      regexList[variableKey] = new RegExp("\\$\\$" + variableKey, "g");
    }

    const absolutePath = getPathToTemplate(key);
    // istanbul ignore next - this is a runtime type guard intended to catch
    // things we forgot long before code hits production.
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Template not found: ${absolutePath}`);
    }

    const rawTemplate = fs.readFileSync(absolutePath).toString();
    templateTransformers.set(key, (args: Record<string, any> = {}) => {
      let newTemplate = rawTemplate;
      for (const [key, value] of Object.entries(args)) {
        newTemplate = newTemplate.replace(regexList[key], value || "");
      }
      return newTemplate;
    });
  }
  return {
    render: (args) =>
      templateTransformers.get(args.template as string)(args.variables),
  };
}
