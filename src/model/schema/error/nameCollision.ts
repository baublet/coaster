export default function nameCollision(
  table: string,
  collisionMap: Record<string, string[]>
): string {
  return `One or more properties on your ${table} schema are too close and could create irregularities in your data models. Please rename one the following column(s):
${Object.keys(collisionMap)
  .map(primary => {
    return `
- ${primary}
  ... has potential collisions with:${collisionMap[primary].map(
    line => `
  - ${line}`
  )}
`;
  })
  .join("\n\n")}`.trim();
}
