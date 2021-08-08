import { DatabaseConnection } from "../";

export interface RawSchema {
  name: string;
  flavor: "mysql" | "pg";
  tables: RawTable[];
}

export interface RawTable {
  name: string;
  comment?: string;
  primaryKeyColumn: string;
  primaryKeyType: RawColumn["type"];
  columns: RawColumn[];
}

export interface RawColumn {
  name: string;
  type: "number" | "string" | "boolean" | "Date" | "JSON" | "unknown";
  columnType: string;
  comment?: string;
  hasDefault: boolean;
  nullable: boolean;
  uniqueConstraints: RawUniqueConstraint[];
  foreignKeys: RawForeignKey[];
}

export type RawUniqueConstraint = string[]; // Constraint column names
export interface RawForeignKey {
  schema?: string;
  table: string;
  column: string;
}

export interface SchemaFetcher {
  (connection: DatabaseConnection, options?: Record<string, any>):
    | Promise<RawSchema[]>
    | RawSchema[];
}

export function fetcherWithConfiguration<T extends SchemaFetcher>(
  f: T,
  fetcherOptions: Parameters<T>[1]
): SchemaFetcher {
  return (connection: DatabaseConnection) => f(connection, fetcherOptions);
}
