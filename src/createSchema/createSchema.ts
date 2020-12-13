import {
  IExecutableSchemaDefinition,
  makeExecutableSchema,
} from "graphql-tools";
import gql from "graphql-tag";
import path from "path";
import fs from "fs";
import { DocumentNode } from "graphql";

export interface Context<RequestContext = any> {
  getRequestContext: () => RequestContext;
  setRequestContext: (context: RequestContext) => void;
}

function getSchemaFromDefinition(definition: string): Promise<DocumentNode> {
  return new Promise((resolve, reject) => {
    const schemaPath = path.resolve(definition);
    fs.readFile(schemaPath, (error, buffer) => {
      if (error) {
        return reject(error);
      }
      return resolve(gql(buffer.toString()));
    });
  });
}

export async function createSchema({
  schemaDefinition,
  ...graphqlOptions
}: {
  schemaDefinition: string;
} & Omit<IExecutableSchemaDefinition<any>, "typeDefs">) {
  const typeDefs = await getSchemaFromDefinition(schemaDefinition);
  return makeExecutableSchema({
    typeDefs,
    ...graphqlOptions,
  });
}
