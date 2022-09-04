import stringify from "safe-json-stringify";

import { CoasterError } from "@baublet/coaster-utils";

const defaultLogger = (...args: any[]) => console.error(...args);

export function logCoasterError(
  error: CoasterError,
  log: (...args: any[]) => void = defaultLogger
): void {
  const details = !error.details
    ? ``
    : `\n\ndetails:
      ${stringify(error.details)}`;

  const stackTraces =
    error.stackTraces.length === 0
      ? ""
      : "\n\n" + error.stackTraces.join(`\n\n`);

  log(
    `--------------------------------------------------------------------------------
| CoasterError                                                                 |
--------------------------------------------------------------------------------
${error.code}
  ${error.time}

${error.message}${details}${stackTraces}
--------------------------------------------------------------------------------`
  );
}
