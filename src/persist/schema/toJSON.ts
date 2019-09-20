import { SchemaDatabase } from ".";

export default function schemaToJSON(
  schema: Record<string, SchemaDatabase>
): string {
  const tree: any = {};

  // Gather all the databases
  Object.keys(schema.databases).forEach(db => {
    tree[db] = {};

    // Get each table for the database
    Object.keys(schema.databases[db].tables).forEach(table => {
      tree[db][table] = {};

      // Get the columns for this table
      Object.keys(schema.databases[db].tables[table]).forEach(col => {
        tree[db][col] = schema.databases[db].tables[table].columns[col];
      });
    });

    // Gather up our indexes for this DB
    tree[db]._indexes = {};
    Object.keys(schema.databases[db].indexes).forEach(index => {
      tree[db]._indexes[index] = schema.databases[db].indexes[index];
    });
  });
  return JSON.stringify(tree);
}
