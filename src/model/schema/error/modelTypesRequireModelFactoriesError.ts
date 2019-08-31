import { SchemaNodeType, SchemaNode } from "..";

export default function modelTypesRequireModelFactoriesError(node: SchemaNode) {
  return `Model ${node.names.canonical} does not have a model defined:

  ${JSON.stringify(node)}
          
  Relational node types (MODEL and MODELS) require a model factory to be passed to it. Pass your model factories to your schema via:
  
  const schema = {
    account: {
      type: SchemaNodeType.MODEL,
      model: createModel({
        name: account
      })
    }
  };`;
}
