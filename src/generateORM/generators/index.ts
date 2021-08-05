import { RawSchema } from "../drivers";
import { Database } from "../index";

export type GeneratorResult = Promise<string> | string;

export type Generator = (
  rawSchema: RawSchema,
  metaData: MetaData
) =>
  | Generator
  | GeneratorResult
  | Promise<Generator>
  | Promise<GeneratorResult>;

export type MetaData = {
  /**
   * Add a header to the generated code. FIFO order. The key is to allow later
   * middleware to modify earlier middleware output, if necessary.
   */
  setHeader: (key: string, value: string) => void;
  /**
   * Map<table_name, TableName> - for mapping table names to their entities.
   */
  tableEntityNames: Map<string, string>;
  /**
   * Map<EntityName, table_name>
   */
  entityTableNames: Map<string, string>;
  /**
   * Function names for querying raw DB entities
   */
  rawBaseQueryFunctionNames: Map<string, string>;
  /**
   * Knex connection info
   */
  connectionInfo: Parameters<Database>;
} & Record<string, any>;
