import { Schema, SchemaNodeType } from "../../../model/schema";
import { MemoryMap } from "../memory";
import { isModelFactory } from "../../../model/createModel";

export default function denormalizeData(
  data: Record<string, any>,
  schema: Schema,
  memoryMap: MemoryMap
) {
  // Loop through the schema and grab all the fields we need to denormalize
  const toDenormalize = Object.values(schema).filter(node => {
    return isModelFactory(node.model);
  });
  console.log(toDenormalize);
}
