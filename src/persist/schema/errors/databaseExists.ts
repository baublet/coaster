export default function databaseExists(database: string): string {
  return `Database ${database} already exists. You either need to choose a new name for the new/renamed database, or remove the old one.`;
}
