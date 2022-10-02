import knex from "knex";
import match from "wildcard-match";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

import {
  GenerateCoasterRdmbsConnectionOptions,
  RdbmsSchema,
  RdbmsTable,
  RdbmsColumn,
} from "../../types";
import { transformName } from "../transformName";

type QueryFunction = <T>(query: string, params?: any[]) => Promise<T>;

const SCHEMA_TO_IGNORE = ["information_schema", "pg_*"];
const isIgnored = match(SCHEMA_TO_IGNORE);

export async function postgres(
  options: GenerateCoasterRdmbsConnectionOptions
): Promise<RdbmsSchema | CoasterError> {
  const connection = knex(options.config);
  const query: QueryFunction = async (query: string, params: any[] = []) => {
    const results = await connection.raw(query, params);
    return results.rows;
  };

  const schemas: string[] = [];

  if (options.schemas) {
    schemas.push(...options.schemas);
  } else {
    const result = await query<{ schema_name: string }[]>(
      "SELECT * FROM information_schema.schemata"
    );

    schemas.push(
      ...result
        .filter((row) => !isIgnored(row.schema_name))
        .map((row) => row.schema_name)
    );
  }

  if (schemas.length === 0) {
    return createCoasterError({
      code: "generateSchema-postgres-noSchemas",
      message: "No schemas found in provided postgres connection",
      details: { options },
    });
  }

  const allTables: RdbmsTable[] = [];
  const schemaTablePromises: Promise<void>[] = [];
  for (const schema of schemas) {
    schemaTablePromises.push(
      attachSchemaTables({ query, schema, allTables, options })
    );
  }
  await Promise.all(schemaTablePromises);

  const schema: RdbmsSchema = {
    tables: allTables,
  };

  return schema;
}

async function attachSchemaTables({
  query,
  schema,
  allTables,
  options,
}: {
  schema: string;
  query: QueryFunction;
  allTables: RdbmsTable[];
  options: GenerateCoasterRdmbsConnectionOptions;
}): Promise<void> {
  const results = await query<
    { table_name: string; table_schema: string; comment?: string }[]
  >(
    `
      SELECT
        t.table_name,
        t.table_schema,
        pg_catalog.obj_description(pgc.oid, 'pg_class') as comment
      FROM information_schema.tables t
      INNER JOIN pg_catalog.pg_class pgc
      ON t.table_name = pgc.relname 
      WHERE t.table_type = 'BASE TABLE'
        AND t.table_schema = ?;
    `,
    [schema]
  );

  const tablePromises: Promise<void>[] = [];
  for (const {
    table_name: tableName,
    table_schema: schemaName,
    comment,
  } of results) {
    const tableNiceName = transformName(
      schemaName === "public" ? tableName : `${schemaName}_${tableName}`,
      options.namingConventions?.tableName
    );

    tablePromises.push(
      new Promise((resolve) => {
        const table: RdbmsTable = {
          name: tableNiceName,
          nameInDb: `"${schemaName}"."${tableName}"`,
          columns: [],
          comment,
        };
        allTables.push(table);

        tablePromises.push(
          attachTableColumns({ query, table, options, schemaName, tableName })
        );
        tablePromises.push(attachTablePrimaryKeys({ query, table, options }));

        resolve();
      })
    );
  }

  await Promise.all(tablePromises);
}

async function attachTableColumns({
  query,
  table,
  options,
  schemaName,
  tableName,
}: {
  table: RdbmsTable;
  query: QueryFunction;
  options: GenerateCoasterRdmbsConnectionOptions;
  schemaName: string;
  tableName: string;
}): Promise<void> {
  const results = await query<
    {
      column_name: string;
      is_nullable: "YES" | "NO";
      data_type: string;
      column_default: string | null;
      is_updatable: "YES" | "NO";
    }[]
  >(
    `
      SELECT *
        FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name  = ?
      ORDER BY ordinal_position;
  `,
    [schemaName, tableName]
  );

  for (const {
    column_default: defaultValue,
    column_name: columnName,
    data_type: dataType,
    is_nullable: isNullable,
    is_updatable: isUpdatable,
  } of results) {
    const columnNiceName = transformName(
      columnName,
      options.namingConventions?.columnName
    );
    const nullable = isNullable === "YES";

    const column: RdbmsColumn = {
      name: columnNiceName,
      nameInDb: `"${columnName}"`,
      type: dataType,
      nullable,
      updatable: isUpdatable === "YES",
      indexed: false,
      hasDefaultValue: defaultValue !== null,
      valueType: getTypeScriptTypeFromPostgresColumnType({
        dataType,
        nullable,
      }),
    };

    table.columns.push(column);
  }
}

async function attachTablePrimaryKeys({}: {
  table: RdbmsTable;
  query: QueryFunction;
  options: GenerateCoasterRdmbsConnectionOptions;
}): Promise<void> {}

function getTypeScriptTypeFromPostgresColumnType({
  dataType,
  nullable,
}: {
  dataType: string;
  nullable: boolean;
}): string {
  const pieces: string[] = nullable ? ["null", "undefined"] : [];

  if (
    dataType.includes("int") ||
    dataType.includes("real") ||
    dataType.includes("numeric") ||
    dataType.includes("decimal") ||
    dataType.includes("double") ||
    dataType.includes("serial")
  ) {
    pieces.push("number");
  } else if (dataType.includes("char") || dataType.includes("text")) {
    pieces.push("string");
  } else if (dataType.includes("bool")) {
    pieces.push("boolean");
  } else if (dataType.includes("date") || dataType.includes("time")) {
    pieces.push("Date");
  }

  return pieces.join(" | ");
}
