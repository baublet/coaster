import { DocumentNode } from "graphql";

import { codegen } from "@graphql-codegen/core";
import * as typescriptPlugin from "@graphql-codegen/typescript";
import * as typescriptResolverPlugin from "@graphql-codegen/typescript-resolvers";

export function generateSchemaTypes(schema: {
  document: DocumentNode;
  schemaFile: string;
}): Promise<string> {
  return codegen({
    documents: [],
    config: {},
    filename: schema.schemaFile,
    schema: schema.document,
    plugins: [
      {
        typescript: {},
      },
      {
        "typescript-resolvers": {
          defaultMapper: "Partial<{T}>",
          useIndexSignature: true,
        },
      },
    ],
    pluginMap: {
      typescript: typescriptPlugin,
      "typescript-resolvers": typescriptResolverPlugin,
    },
  });
}
