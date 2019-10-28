export default function renameTable(from: string, to: string): string {
  return `ALTER TABLE ${from} RENAME TO ${to}`;
}
