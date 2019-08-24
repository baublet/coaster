import validate from "./validate";
import uniqueNames from "./uniqueNames";
import { Schema } from "..";

export default function(schema: Schema) {
  return validate(schema, [uniqueNames]);
}