import yargs from "yargs";

import { gql } from "./gql";

export function commands(builder: yargs.Argv) {
  gql(builder);
}
