import { getTestColumnTypeForSchemaColumn } from "./getTestColumnTypeForSchemaColumn";
import { RawColumn, RawTable } from "../../drivers";

export function getTestColumnDefinitionForColumn(
  column: RawColumn,
  table: Pick<RawTable, "primaryKeyColumn" | "uniqueConstraints">,
  knexObjectName: string = "table"
): string {
  let columnDefinition = "";

  const type = getTestColumnTypeForSchemaColumn(column);
  columnDefinition += `    ${knexObjectName}.${type}("${column.name}")`;

  if (column.nullable) {
    columnDefinition += `.nullable()`;
  } else {
    columnDefinition += `.notNullable()`;
  }

  if (column.defaultTo) {
    columnDefinition += `.defaultTo("${column.defaultTo}")`;
  }

  if (
    table.uniqueConstraints.some(
      (constraint) => constraint.length === 1 && constraint[0] === column.name
    )
  ) {
    columnDefinition += ".unique()";
  }

  columnDefinition += ";\n";

  const isPrimary = table.primaryKeyColumn === column.name;
  if (isPrimary) {
    columnDefinition += `    ${knexObjectName}.primary(["${column.name}"]);\n`;
  }

  return columnDefinition;
}
