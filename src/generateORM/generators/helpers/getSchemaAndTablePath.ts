export function getSchemaAndTablePath(
  schemaName: string | undefined,
  tableName: string
): string {
  return (schemaName ? schemaName + "." : "") + tableName;
}
