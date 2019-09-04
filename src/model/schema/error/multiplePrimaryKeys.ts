export default function multiplePrimaryKeys(
  table: string,
  keys: string
): string {
  return `It looks like we set multiple primary keys on ${table}. Keys: ${keys}.`;
}
