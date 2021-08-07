import { generateNames } from "../../../generateNames";

export function getName(
  column: string | undefined,
  table: string | undefined,
  schema: string,
  prefixSchemaName: boolean = false,
  getNameFn?: (
    column: string | undefined,
    table: string | undefined,
    schema: string
  ) => string | undefined
): string {
  if (getNameFn) {
    const generatedName = getNameFn(column, table, schema);
    if (generatedName) {
      return generatedName;
    }
  }

  if (column) {
    const columnNames = generateNames(column);
    return columnNames.rawCamel;
  }

  const schemaNames = generateNames(schema);
  const schemaNameInType = schemaNames.rawPascal;

  if (table) {
    const tableNames = generateNames(table);
    const entityName =
      (prefixSchemaName ? schemaNameInType : "") + tableNames.singularPascal;

    return entityName;
  }

  return schemaNameInType;
}
