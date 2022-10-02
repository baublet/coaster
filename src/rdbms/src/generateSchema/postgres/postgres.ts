import knex from "knex";
import match from "wildcard-match";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

import {
  GenerateCoasterRdbmsConnectionOptions,
  RdbmsSchema,
  RdbmsTable,
  RdbmsColumn,
} from "../../types";
import { transformName } from "../transformName";

type QueryFunction = <T>(query: string, params?: any[]) => Promise<T>;

const SCHEMA_TO_IGNORE = ["information_schema", "pg_*"];
const isIgnored = match(SCHEMA_TO_IGNORE);

export async function postgres(
  options: GenerateCoasterRdbmsConnectionOptions
): Promise<RdbmsSchema | CoasterError> {
  const connection = knex(options.config);
  const query: QueryFunction = async (query: string, params: any[] = []) => {
    const results = await connection.raw(query, params);
    return results.rows;
  };

  const schemas: string[] = [];

  const { indexes } = await getSystemIndexes({
    query,
    options,
  });

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
      attachSchemaTables({ query, schema, allTables, options, indexes })
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
  indexes,
}: {
  schema: string;
  query: QueryFunction;
  allTables: RdbmsTable[];
  options: GenerateCoasterRdbmsConnectionOptions;
  indexes: Map<string, boolean>;
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
    const tableNiceName = transformName({
      name: schemaName === "public" ? tableName : `${schemaName}_${tableName}`,
      transformer: options.namingConventions?.tableName,
      defaultTransformer: "pascalCase",
    });

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
          attachTableColumns({
            query,
            table,
            options,
            schemaName,
            tableName,
            indexes,
          })
        );

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
  indexes,
}: {
  table: RdbmsTable;
  query: QueryFunction;
  options: GenerateCoasterRdbmsConnectionOptions;
  schemaName: string;
  tableName: string;
  indexes: Map<string, boolean>;
}): Promise<void> {
  const columns = await query<
    {
      defaultValue: string | null;
      columnName: string;
      isNullable: "YES" | "NO";
      dataType: string;
      columnDefault: string | null;
      isUpdatable: "YES" | "NO";
    }[]
  >(
    `
      SELECT column_default AS "defaultValue",
        column_name AS "columnName",
        data_type AS "dataType",
        is_nullable AS "isNullable",
        is_updatable AS "isUpdatable"
      FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name = ?
      ORDER BY ordinal_position;
  `,
    [schemaName, tableName]
  );

  for (const {
    defaultValue,
    columnName,
    dataType,
    isNullable,
    isUpdatable,
  } of columns) {
    const columnNiceName = transformName({
      name: columnName,
      transformer: options.namingConventions?.columnName,
      defaultTransformer: "camelCase",
    });
    const nullable = isNullable === "YES";

    const column: RdbmsColumn = {
      name: columnNiceName,
      nameInDb: `"${columnName}"`,
      type: dataType,
      nullable,
      updatable: isUpdatable === "YES",
      indexed: Boolean(indexes.get(`${schemaName}.${tableName}.${columnName}`)),
      hasDefaultValue: defaultValue !== null,
      valueType: getTypeScriptTypeFromPostgresColumnType({
        dataType,
        nullable,
      }),
    };

    table.columns.push(column);
  }
}

async function getSystemIndexes({
  query,
}: {
  query: QueryFunction;
  options: GenerateCoasterRdbmsConnectionOptions;
}): Promise<{
  indexes: Map<string, boolean>;
  data: {
    schemaName: string;
    tableName: string;
    columnNames: string[];
    isPrimary: boolean;
  }[];
}> {
  const results = await query<
    {
      schemaName: string;
      tableName: string;
      columnNames: string[];
      isUnique: boolean;
      isPrimary: boolean;
    }[]
  >(
    `
    SELECT
      U.usename                AS "userName",
      ns.nspname               AS "schemaName",
      idx.indrelid :: REGCLASS AS "tableName",
      i.relname                AS "indexName",
      idx.indisunique          AS "isUnique",
      idx.indisprimary         AS "isPrimary",
      am.amname                AS "indexType",
      idx.indkey,
          ARRAY(
              SELECT pg_get_indexdef(idx.indexrelid, k + 1, TRUE)
              FROM
                generate_subscripts(idx.indkey, 1) AS k
              ORDER BY k
          ) AS "columnNames",
      (idx.indexprs IS NOT NULL) OR (idx.indkey::int[] @> array[0]) AS "isFunctional",
      idx.indpred IS NOT NULL AS "isPartial"
    FROM pg_index AS idx
      JOIN pg_class AS i
        ON i.oid = idx.indexrelid
      JOIN pg_am AS am
        ON i.relam = am.oid
      JOIN pg_namespace AS NS ON i.relnamespace = NS.OID
      JOIN pg_user AS U ON i.relowner = U.usesysid
    WHERE NOT nspname LIKE 'pg%'; -- Excluding system tables
    `
  );

  const data = results.map((result) => ({
    schemaName: result.schemaName,
    tableName: result.tableName,
    isPrimary: result.isPrimary,
    columnNames: result.columnNames,
  }));

  const indexes = new Map<string, boolean>();

  for (const { schemaName, tableName, columnNames } of data) {
    for (const columnName of columnNames) {
      indexes.set(`${schemaName}.${tableName}.${columnName}`, true);
    }
  }

  return { indexes, data };
}

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
    dataType.includes("money") ||
    dataType.includes("serial")
  ) {
    pieces.push("number");
  } else if (
    dataType.includes("char") ||
    dataType.includes("text") ||
    dataType.includes("uuid")
  ) {
    pieces.push("string");
  } else if (dataType.includes("bool")) {
    pieces.push("boolean");
  } else if (
    dataType.includes("date") ||
    dataType.includes("time") ||
    dataType.includes("interval")
  ) {
    pieces.push("Date");
  } else if (dataType.includes("json")) {
    pieces.push("any");
  } else {
    pieces.push("unknown");
  }

  return pieces.join(" | ");
}
