import { RawSchema } from "../drivers";

export interface Generator {
  (
    rawSchema: RawSchema,
    metaData: MetaData,
    generatorOptions?: Record<string, any>
  ): Promise<string> | string;
}

export type MetaData = Record<string, any>;
