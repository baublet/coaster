import stringifyObject from "stringify-object";
import { Schema } from "..";

export default function uncompilableSchema(schema: Schema) {
  return `We are unable to compile your schema due to validation errors:
  
  ${stringifyObject(schema)}`;
}
