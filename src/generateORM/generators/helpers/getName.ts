import { generateNames } from "../../../generateNames";

export function getName(
  schema: string,
  table?: string,
  column?: string,
  prefixSchemaName?: boolean,
  getNameFn?: (
    schema: string,
    table?: string,
    column?: string
  ) => string | undefined
): string {
  if (getNameFn) {
    const generatedName = getNameFn(schema, table, column);
    if (generatedName) {
      return generatedName;
    }
  }

  if (column) {
    const columnNames = generateNames(column);
    return columnNames.rawCamel;
  }

  const schemaNames = generateNames(schema);
  const schemaNameInType = getNameFn
    ? getNameFn(schema) || schemaNames.rawPascal
    : schemaNames.rawPascal;

  if (table) {
    const tableNames = generateNames(table);
    const entityName =
      (prefixSchemaName ? schemaNameInType : "") +
      (getNameFn
        ? getNameFn(schema, table) || tableNames.singularPascal
        : tableNames.singularPascal);

    return entityName;
  }

  return schemaNameInType;
}
