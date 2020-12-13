import fs from "fs";
import path from "path";

import glob from "glob";
import yargs from "yargs";
import { parse, DocumentNode } from "graphql";

import { generateSchemaTypes } from "./generateSchemaTypes";

const defaultPatterns = "**/*.g?(raph)ql";

export async function generate(args: yargs.Arguments) {
  const [, ...globPatterns] = args._;
  const schemas = glob.sync(
    globPatterns.length > 0 ? globPatterns.join("|") : defaultPatterns
  );

  const schemaDocuments = await Promise.all(
    schemas.map((schemaFile) => {
      return new Promise<{
        document: DocumentNode;
        outputFile: string;
        schemaFile: string;
        schemaFileText: string;
      }>((resolve, reject) => {
        fs.readFile(schemaFile, {}, (error, data) => {
          if (error) {
            return reject(error);
          }
          const outputFile = path.resolve(
            path.dirname(schemaFile),
            path.basename(schemaFile) + ".ts"
          );
          const schemaFileText = data.toString();
          const document = parse(schemaFileText);
          resolve({
            outputFile,
            schemaFile,
            schemaFileText,
            document: document,
          });
        });
      });
    })
  );

  await Promise.all(
    schemaDocuments.map(async (schema) => {
      return new Promise<void>((resolve) => {
        generateSchemaTypes(schema).then((types) => {
          fs.writeFile(schema.outputFile, types, () => {
            resolve();
          });
        });
      });
    })
  );
}
