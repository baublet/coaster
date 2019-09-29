import { SchemaDatabase } from ".";

export default function schemaToJSON(
  schema: Record<string, SchemaDatabase>
): Record<string, any> {
  const tree: any = {};

  // Gather all the databases
  Object.keys(schema).forEach(db => {
    tree[db] = {};

    // Get each table for the database
    Object.keys(schema[db].tables).forEach(table => {
      tree[db][table] = {};

      // Get the columns for this table
      Object.keys(schema[db].tables[table].columns).forEach(col => {
        tree[db][table][col] = schema[db].tables[table].columns[col].options;
      });
    });

    // Gather up our indexes for this DB
    tree[db]._indexes = {};
    Object.keys(schema[db].indexes).forEach(index => {
      tree[db]._indexes[index] = schema[db].indexes[index];
    });
  });
  return tree;
}
