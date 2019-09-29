import { PersistAdapter } from "persist";
import { SchemaBuilderOperation } from "..";

export default function operationNotSupported(
  adapter: PersistAdapter,
  operation: SchemaBuilderOperation
) {
  return `It looks like we need to run an operation on the ${
    adapter.name
  } adapter. The adapter unfortunately not support this operation:

  ${JSON.stringify(operation)}`;
}
