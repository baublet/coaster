import stringify from "safe-json-stringify";

import { CoasterError } from "@baublet/coaster-utils";

export function logCoasterError(error: CoasterError): void {
  const details = !error.details
    ? ``
    : `\n- details:
      ${stringify(error.details)}`;
  const errorDetails = !error.error
    ? ""
    : `\n- details:
      ${stringify(error.error)}`;

  console.error(
    `--------------------------------------------------------------------------------
| CoasterError                                                                 |
--------------------------------------------------------------------------------
- code:
      ${error.code}
- message:
      ${error.message}${details}${errorDetails}
--------------------------------------------------------------------------------`
  );
}
