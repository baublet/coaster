import stringify from "safe-json-stringify";

import { CoasterError } from "@baublet/coaster-utils";

export function logCoasterError(error: CoasterError): void {
  console.log(new Error().stack);
  const details = !error.details
    ? ``
    : `\n- details:
      ${stringify(error.details)}`;

  console.error(
    `--------------------------------------------------------------------------------
| CoasterError                                                                 |
--------------------------------------------------------------------------------
- code:
      ${error.code}
- message:
      ${error.message}${details}
--------------------------------------------------------------------------------`
  );
}
