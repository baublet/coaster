import yargs from "yargs";

import { generate } from "./generate";

export function gql(builder: yargs.Argv) {
  builder.command(
    "gql:generate",
    "Generate TypeScript types from GraphQL",
    {},
    generate
  );
}
