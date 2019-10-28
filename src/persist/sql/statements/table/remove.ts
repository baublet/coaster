export default function removeTable(tableName: string): string {
  return `DROP TABLE ${tableName}`;
}
