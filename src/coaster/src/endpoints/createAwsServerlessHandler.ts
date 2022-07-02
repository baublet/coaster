import { Handler } from "aws-lambda";

import { CoasterError } from "@baublet/coaster-utils";

export async function createAwsServerlessHandler(): Promise<
  Handler | CoasterError
> {
  return () => {};
}
