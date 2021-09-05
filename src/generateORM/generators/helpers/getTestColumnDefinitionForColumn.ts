import { getTestColumnTypeForSchemaColumn } from "./getTestColumnTypeForSchemaColumn";
import { RawColumn, RawTable } from "../../drivers";

export function getTestColumnDefinitionForColumn(
  column: RawColumn,
  table: RawTable,
  knexObjectName: string = "table"
): string {
  let tableDefinition = "";

  const type = getTestColumnTypeForSchemaColumn(column);
  tableDefinition += `    ${knexObjectName}.${type}("${column.name}")`;

  if (column.nullable) {
    tableDefinition += `.nullable()`;
  } else {
    tableDefinition += `.notNullable()`;
  }

  if (column.defaultTo) {
    tableDefinition += `.defaultTo("${column.defaultTo}")`;
  }

  for (const unique of column.uniqueConstraints) {
    if (unique.length === 1) {
      tableDefinition += `.unique("${unique[0]}")`;
    } else {
      tableDefinition += `.unique(["${unique.join(`", "`)}"])`;
    }
  }

  tableDefinition += ";\n";

  const isPrimary = table.primaryKeyColumn === column.name;
  if (isPrimary) {
    tableDefinition += `    ${knexObjectName}.primary("${column.name}");\n`;
  }

  return tableDefinition;
}
