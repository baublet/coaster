import { RawColumn, RawSchema, RawTable } from "../../drivers";
import { GetTypeName, MetaData } from "../../generators";

export function getTypeName({
  column,
  metaData,
  schema,
  table,
  getTypeName = () => undefined,
  rawOrNamed,
}: {
  metaData: MetaData;
  column: RawColumn;
  table: RawTable;
  schema: RawSchema;
  getTypeName?: GetTypeName;
  rawOrNamed: "raw" | "named";
}): string {
  const mapToUse =
    rawOrNamed === "raw"
      ? metaData.rawDatabaseEnumNames
      : metaData.namedDatabaseEnumNames;
  if (column.type === "enum") {
    const userDeclaredColumnTypeName = getTypeName(
      column.type,
      column.name,
      table.name,
      schema.name
    );
    if (userDeclaredColumnTypeName) {
      return userDeclaredColumnTypeName;
    } else if (mapToUse.has(column.enumPath)) {
      return mapToUse.get(column.enumPath);
    } else {
      return "string";
    }
  }
  return (
    getTypeName(column.type, column.name, table.name, schema.name) ||
    column.type
  );
}
