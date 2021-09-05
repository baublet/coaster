import { RawColumn, RawSchema } from "../drivers";
import { getTemplateManager } from "./helpers";

type GeneratorFinalResult = {
  code: string;
  testCode: string;
};
export type GeneratorResult =
  | Promise<GeneratorFinalResult>
  | GeneratorFinalResult;

export type Generator = (
  rawSchema: RawSchema,
  metaData: MetaData,
  options?: any
) =>
  | Generator
  | GeneratorResult
  | Promise<Generator>
  | Promise<GeneratorResult>;

export type MetaData = {
  generateTestCode: boolean;
  codeOutputFullPath: string;
  testConnectionVariable: string;
  templateManager: ReturnType<typeof getTemplateManager>;
  /**
   * Add a header to the generated code. FIFO order. The key is to allow later
   * middleware to modify earlier middleware output, if necessary.
   */
  setHeader: (key: string, value: string) => void;
  /**
   * Add a header to the generated test code. FIFO order. The key is to allow later
   * middleware to modify earlier middleware output, if necessary.
   */
  setTestHeader: (key: string, value: string) => void;
  /**
   * Map<table_name, TableName> - for mapping table names to their entities.
   */
  tableEntityNames: Map<EntityPath, EntityName>;
  /**
   * Map<EntityName, table_name>
   */
  entityTableNames: Map<EntityName, EntityPath>;
  /**
   * Map<table_name, TableName> - for mapping table names to their raw entities.
   */
  tableRawEntityNames: Map<EntityPath, EntityName>;
  /**
   * Function names for querying raw DB entities
   */
  rawBaseQueryFunctionNames: Map<EntityPath, FunctionName>;
  /**
   * Each entity needs a type assertion shipped with it for runtime correctness
   * and data transformations
   */
  typeAssertionFunctionNames: Map<EntityPath, FunctionName>;
  /**
   * Each entity needs type guards for runtime correctness and data
   * transformations
   */
  typeGuardFunctionNames: Map<EntityPath, FunctionName>;
  /**
   * For transforming results from/to the raw/named types
   */
  transformerFunctionNames: Record<FromEntity, Record<ToEntity, FunctionName>>;
  /**
   * Named entity column names. E.g., for `public.user_accounts.user_data`, this
   * might return `userData` depending on the naming policy
   */
  namedEntityColumnNames: Map<EntityPath, string>;
  /**
   * Inputs are different -- e.g., both nullable and non-nullable fields with
   * defaults can both allow null values as input. This is how we reference them
   */
  namedEntityInputTypeNames: Map<EntityPath, string>;
  /**
   * Raw database enums stored as Map<`schema.enum`, "RawSchemaEnumEnum">.
   */
  rawDatabaseEnumNames: Map<EntityPath, string>;
  /**
   * Named database enums stored as Map<`schema.enum`, "SchemaEnumEnum">;
   */
  namedDatabaseEnumNames: Map<EntityPath, string>;
  /**
   * Raw test entity creation function names stored as Map<`schema.table`, "createRawTestSchemaTable">
   */
  rawCreateTestEntityFunctionNames: Map<EntityPath, string>;
  /**
   * Named test entity creation function names stored as Map<`schema.table`, "createTestSchemaTable">
   */
  namedCreateTestEntityFunctionNames: Map<EntityPath, string>;
  /**
   * An array of enum values stored as Map<`schema.enum`, string[]>
   */
  rawEnumValues: Map<EntityPath, string[]>;
};

/**
 * Named primitives to help understand the above maps
 */
type EntityPath = string;
type FromEntity = string;
type ToEntity = string;
type FunctionName = string;
type EntityName = string;

export type GetTypeName = (
  type: RawColumn["type"],
  column: string,
  table: string,
  schema: string
) => string | undefined;

export { rawTypes } from "./rawTypes";
export { rawBaseQuery } from "./rawBaseQuery";
export { typesWithNamingPolicy } from "./typesWithNamingPolicy";
export { typedCrud } from "./typedCrud";

export function generatorWithConfiguration<T extends Generator>(
  generator: T,
  generatorOptions: Parameters<T>[2]
): Generator {
  return (rawSchema: RawSchema, metaData: MetaData) =>
    generator(rawSchema, metaData, generatorOptions);
}
