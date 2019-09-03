export default function unknownSchemaNodeType(
  type: string,
  table: string
): string {
  return `Unknown schema node type ${type} in table ${table}. This is an internal error that the tooling developers need to fix.`;
}
