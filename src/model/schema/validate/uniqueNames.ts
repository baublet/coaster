import { Schema, SchemaNode } from "..";
import timesElementIsInArray from "../../../helpers/timesElementIsInArray";

const message = (
  nodes: SchemaNode[]
) => `Schema nodes must be unique. You have keys that when compiled share the same name:

${JSON.stringify(nodes)}
`;

function getNodeCollisions(name: string, schema: Schema): SchemaNode[] {
  const nodes = [];
  Object.values(schema).forEach(node => {
    if (node.uniqueName === name) {
      nodes.push(node);
    }
  });
  return nodes;
}

export default function columnsNamesAreUnique(schema: Schema): true | string {
  const errors: Record<string, string> = {};
  const names: string[] = Object.values(schema).map(node => node.uniqueName);
  names.forEach(name => {
    if (timesElementIsInArray(name, names) > 1) {
      const nodes = getNodeCollisions(name, schema);
      errors[name] = message(nodes);
    }
  });
  const errorsArray = Object.values(errors);
  if (errorsArray.length) {
    return errorsArray.join("\n\n");
  }
  return true;
}
