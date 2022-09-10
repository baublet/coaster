import stringify from "safe-json-stringify";

import { CoasterError } from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

export function logCoasterError(
  error: CoasterError,
  logFunction?: (...args: any[]) => void
): void {
  const logger = logFunction || log.error;
  const details = !error.details
    ? ``
    : `\n\ndetails:
      ${stringify(error.details)}`;

  const stackTraces =
    error.stackTraces.length === 0
      ? ""
      : "\n\n" + error.stackTraces.join(`\n\n`);

  logger(
    `--------------------------------------------------------------------------------
| CoasterError                                                                 |
--------------------------------------------------------------------------------
${error.code}
  ${error.time}

${error.message}${details}${stackTraces}
--------------------------------------------------------------------------------`
  );
}
