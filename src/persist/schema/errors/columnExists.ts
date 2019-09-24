export default function columnExists(
  databaseName: string,
  tableName: string,
  name: string
): string {
  return `Oops! We tried to create a column named ${name} on ${databaseName}.${tableName}. That column already exists on that table. Maybe we already created it?`;
}
