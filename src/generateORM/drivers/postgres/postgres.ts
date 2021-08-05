import { SchemaFetcher, RawSchema, RawTable } from "..";
import { shouldExclude, dbTypeToTypeScriptType } from "../helpers";

interface PostgresOptions {
  /**
   * If not provided, we gather objects from only the `public` schema
   */
  schemas?: string[];
  /**
   * Table patterns to exclude. Uses `wildcard-match` under the hood.
   */
  excludeTables?: string[];
}

/**
 * TODO: this can almost certainly be optimized to avoid nested loops
 */
export const pgSchemaFetcher: SchemaFetcher = async (
  connection,
  options: PostgresOptions = {
    excludeTables: [],
  }
) => {
  const schemas = options.schemas || ["public"];
  const schemaTables: Record<string, string[]> = {};

  const queryResults = await connection
    .select<{ table_name: string; table_schema: string }[]>()
    .from("information_schema.tables");
  for (const schema of schemas) {
    schemaTables[schema] = [];
    const resultTables = queryResults.filter(
      (table) => table.table_schema === schema
    );
    for (const table of resultTables) {
      schemaTables[schema].push(table.table_name);
    }
  }

  const rawSchema: RawSchema[] = [];

  for (const [schemaName, tableNames] of Object.entries(schemaTables)) {
    const schemaTables: RawTable[] = [];
    for (const tableName of tableNames) {
      if (shouldExclude(options.excludeTables, tableName)) {
        continue;
      }

      const tableData = await connection
        .select<
          {
            column_name: string;
            column_default: string;
            is_nullable: "YES" | "NO";
            data_type: string;
            is_updatable: "YES" | "NO";
          }[]
        >()
        .from("information_schema.columns")
        .where("table_schema", "=", schemaName)
        .andWhere("table_name", "=", tableName);

      const rawTable: RawTable = {
        name: tableName,
        columns: [],
      };

      for (const tableColumn of tableData) {
        rawTable.columns.push({
          name: tableColumn.column_name,
          nullable: tableColumn.is_nullable === "YES",
          columnType: tableColumn.data_type,
          foreignKeys: [],
          uniqueConstraints: [],
          type: dbTypeToTypeScriptType(tableColumn.data_type),
        });
      }

      const foreignKeys = await connection.raw<{
        rows: {
          constraint_name: string;
          column_name: string;
          foreign_table_name: string;
          foreign_table_schema: string;
          foreign_column_name: string;
        }[];
      }>(`
      SELECT
          tc.table_schema, 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name='${tableName}'
          AND tc.table_schema='${schemaName}';
          `);

      for (const rawConstraint of foreignKeys.rows) {
        const column = rawTable.columns.find(
          (c) => c.name === rawConstraint.column_name
        );
        if (!column) {
          // TODO: handle where a column has a constraint that points to non-existent column
          continue;
        }
        column.foreignKeys.push({
          column: rawConstraint.foreign_column_name,
          table: rawConstraint.foreign_table_name,
          schema: rawConstraint.foreign_table_schema,
        });
      }

      // TODO: load the unique constraints

      schemaTables.push(rawTable);
    }

    rawSchema.push({
      name: schemaName,
      tables: schemaTables,
    });
  }

  return rawSchema;
};
