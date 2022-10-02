import type { Knex } from "knex";

export interface RdbmsSchema {
  /**
   * The tables in the schema
   */
  tables: RdbmsTable[];
}

export interface RdbmsTable {
  /**
   * The nice, generated name for the table or view
   */
  name: string;
  /**
   * The name of the table or view in the database
   */
  nameInDb: string;
  /**
   * If applicable, the comment attached to the table or view
   */
  comment?: string;
  /**
   * The primary key(s) of the table or view. If multiple columns are provided,
   * this indicates a compound primary key for the table or view.
   *
   * In the form of `columnName` that references the nice name of the column or
   * view in the `columns` node of this table or view.
   *
   * This could be undefined if this is a view, or the table doesn't have a
   * primary key.
   */
  primaryKey?: string | string[];
  /**
   * The columns in the table or view
   */
  columns: RdbmsColumn[];
}

export interface RdbmsColumn {
  /**
   * The nice, generated name for the column
   */
  name: string;
  /**
   * The name of the column in the database
   */
  nameInDb: string;
  /**
   * The actual name of the type in the database system
   */
  type: string;
  /**
   * True if this column in nullable, false otherwise
   */
  nullable: boolean;
  /**
   * True if this column is updatable, false otherwise
   */
  updatable: boolean;
  /**
   * True if this column has a default value, false otherwise
   */
  hasDefaultValue: boolean;
  /**
   * We use this to tell our RDBMS connector whether or not this is a searchable
   * field. If columns aren't indexed, we protect users from negatively affecting
   * performance by doing un-indexed lookups.
   *
   * Caveat: this can be overwritten by an option when generating the RDMBS
   * connector (`allowUnindexedLookups: true`).
   */
  indexed: boolean;
  /**
   * The in-code type type of this column for the RDBMS connector
   */
  valueType: string | number | Date | boolean | null;
  /**
   * If applicable, the comment attached to the column
   */
  comment?: string;
}

export type RdbmsConfig = Knex.Config;

export interface GenerateCoasterRdmbsConnectionOptions {
  /**
   * A pointer for connecting to your RDBMS source of truth. Follows the Knex
   * signature for connecting to a database.
   */
  config: RdbmsConfig;
  /**
   * If you want to allow unindexed lookups, set this to true. If you want to
   * constrain unindexed lookups to certain tables and columns, set this to
   * an array of strings in the format of `table` or `table.column`. If the
   * tables and/or columns are invalid, this will trigger an error at generation
   * time, rather than runtime.
   *
   * For example, to allow an unindexed lookup on the `users` table, you would
   * provide `["users"]`. To allow an unindexed lookup only on the `users`
   * table's names, you would provide `["users.name"]`.
   */
  allowUnindexedLookups?: boolean | string[];
  /**
   * If applicable for the database type, enter the name of schemas you want to
   * generate an ORM for. If you don't provide this, we'll generate an ORM for
   * all schemas in the database visible to the user in the provided config.
   */
  schemas?: string[];
  /**
   * Allows you to specify a custom name for the generated ORM. If you don't
   * provide this, we default to camelCase for generated code, that is transformed
   * into the database format in-code.
   */
  namingConventions?: {
    schemaName?: NameTransformer;
    tableName?: NameTransformer;
    columnName?: NameTransformer;
  };
}

export type NameTransformer = (name: string) => string;
