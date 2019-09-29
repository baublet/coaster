export default function columnNotFound(
  databaseName: string,
  tableName: string,
  columnName: string
): string {
  return `We tried to perform an action on a column that doesn't exist on ${databaseName}.${tableName}. To modify ${columnName}, we first need to create it:

  schema
    .database("${databaseName}")
    .table("${tableName}")
    .createColumn("${columnName}");`;
}
