import stringify from "safe-json-stringify";

import { CoasterError } from "@baublet/coaster-utils";

export function logCoasterError(error: CoasterError): void {
  const details = !error.details
    ? ``
    : `\n\ndetails:
      ${stringify(error.details)}`;

  const stackTraces =
    error.stackTraces.length === 0
      ? ""
      : "\n\n" + error.stackTraces.join(`\n\n`);

  console.error(
    `--------------------------------------------------------------------------------
| CoasterError                                                                 |
--------------------------------------------------------------------------------
${error.code}
  ${error.time}

${error.message}${details}${stackTraces}
--------------------------------------------------------------------------------`
  );
}
