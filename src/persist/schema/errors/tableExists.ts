export default function tableExists(database: string, table: string): string {
  return `We tried to create or rename a table to a name that already exists. ${database}.table("${table}") already exists. You either need to choose a new name for the new/renamed table, or remove the old one.`;
}
