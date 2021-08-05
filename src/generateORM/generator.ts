import { RawSchema } from "./drivers";
import { Generator, MetaData } from "./generators";

export function generator<
  G extends (rawSchema: RawSchema, metaData: MetaData, ...args: any) => any
>(generator: G, options: Parameters<G>[2]): Generator {
  return (rawSchema: RawSchema, metaData: MetaData) =>
    generator(rawSchema, metaData, options);
}
