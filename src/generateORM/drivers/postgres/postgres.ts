import { RawEnum, RawSchema, RawTable } from "..";
import { shouldExclude, dbTypeToTypeScriptType } from "../helpers";
import { DatabaseConnection } from "../../";

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

export const pgSchemaFetcher = async (
  connection: DatabaseConnection,
  options: PostgresOptions = {
    excludeTables: [],
  }
) => {
  const schemas = options.schemas || ["public"];
  const schemaTables: Record<string, string[]> = {};
  const tableComments: Map<string, string> = new Map();

  const queryResults = await connection
    .select<
      { table_name: string; table_schema: string; obj_description: string }[]
    >(
      connection.raw(
        "* , obj_description(('\"' || table_schema || '\"' || '.'|| '\"' || table_name || '\"')::regclass)"
      )
    )
    .from("information_schema.tables");
  for (const schema of schemas) {
    schemaTables[schema] = [];
    const resultTables = queryResults.filter(
      (table) => table.table_schema === schema
    );
    for (const table of resultTables) {
      schemaTables[schema].push(table.table_name);
      tableComments.set(
        `${table.table_schema}.${table.table_name}`,
        table.obj_description
      );
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
            column_default?: string | null;
            is_nullable: "YES" | "NO";
            data_type: string;
            is_updatable: "YES" | "NO";
            udt_name: string;
            col_description: string | null;
          }[]
        >(
          connection.raw(
            `*, col_description('"${schemaName}"."${tableName}"'::regclass, ordinal_position)`
          )
        )
        .from("information_schema.columns")
        .where("table_schema", "=", schemaName)
        .andWhere("table_name", "=", tableName);

      const tablePrimaryKeys: {
        rows: {
          attname: string;
          format_type: string;
        }[];
      } = await connection.raw(`
      SELECT
        pg_attribute.attname, 
        format_type(pg_attribute.atttypid, pg_attribute.atttypmod)
      FROM pg_index, pg_class, pg_attribute, pg_namespace 
      WHERE 
        pg_class.relname = '${tableName}' AND
        indrelid = pg_class.oid AND 
        nspname = '${schemaName}' AND 
        pg_class.relnamespace = pg_namespace.oid AND 
        pg_attribute.attrelid = pg_class.oid AND 
        pg_attribute.attnum = any(pg_index.indkey)
      AND indisprimary`);
      const primaryKey = tablePrimaryKeys.rows[0];

      const rawTable: RawTable = {
        name: tableName,
        columns: [],
        primaryKeyColumn: primaryKey.attname,
        primaryKeyType: dbTypeToTypeScriptType(primaryKey.format_type),
        comment: tableComments.get(`${schemaName}.${tableName}`),
      };

      for (const tableColumn of tableData) {
        const tsType = dbTypeToTypeScriptType(tableColumn.data_type);
        const enumPath =
          tsType === "enum"
            ? `${schemaName}.${tableColumn.udt_name}`
            : undefined;
        rawTable.columns.push({
          name: tableColumn.column_name,
          comment: tableColumn.col_description,
          nullable: tableColumn.is_nullable === "YES",
          hasDefault:
            tableColumn.column_default !== null ||
            tableColumn.column_default !== undefined,
          defaultTo: tableColumn.column_default,
          columnType: tableColumn.data_type,
          foreignKeys: [],
          uniqueConstraints: [],
          type: tsType,
          enumPath,
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

    // Enums
    const enums = await connection.raw<{
      rows: {
        enum_name: string;
        enum_value: string;
      }[];
    }>(`SELECT t.typname AS enum_name,
    e.enumlabel AS enum_value
  FROM pg_type t 
    JOIN pg_enum e on t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = '${schemaName}'`);
    const enumsMap = new Map<string, string[]>();
    for (const { enum_name, enum_value } of enums.rows) {
      if (!enumsMap.has(enum_name)) {
        enumsMap.set(enum_name, []);
      }
      enumsMap.get(enum_name).push(enum_value);
    }

    const schemaEnums: RawEnum[] = [];
    for (const [enumName, enumValues] of enumsMap) {
      schemaEnums.push({
        name: enumName,
        values: enumValues,
      });
    }

    rawSchema.push({
      flavor: "pg",
      name: schemaName,
      tables: schemaTables,
      enums: schemaEnums,
    });
  }

  return rawSchema;
};
