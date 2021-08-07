import { RawColumn, RawSchema } from "../drivers";

export type GeneratorResult = Promise<string> | string;

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
  /**
   * Add a header to the generated code. FIFO order. The key is to allow later
   * middleware to modify earlier middleware output, if necessary.
   */
  setHeader: (key: string, value: string) => void;
  /**
   * Map<table_name, TableName> - for mapping table names to their entities.
   */
  tableEntityNames: Map<EntityPath, string>;
  /**
   * Map<EntityName, table_name>
   */
  entityTableNames: Map<EntityPath, string>;
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
} & Record<string, any>;

/**
 * The raw path to the entity. E.g., in schema `my_app`, table `user_account`,
 * this would be `my_app.user_account`
 */
type EntityPath = string;
type FromEntity = string;
type ToEntity = string;
type FunctionName = string;

export type GetTypeName = (
  type: RawColumn["type"],
  column: string,
  table: string,
  schema: string
) => string | undefined;

export { rawTypes } from "./rawTypes";
export { baseQueryTypeScript } from "./baseQueryTypeScript";
export { typesWithNamingPolicy } from "./typesWithNamingPolicy";

export function generatorWithConfiguration<T extends Generator>(
  generator: T,
  generatorOptions: Parameters<T>[2]
): Generator {
  return (rawSchema: RawSchema, metaData: MetaData) =>
    generator(rawSchema, metaData, generatorOptions);
}
