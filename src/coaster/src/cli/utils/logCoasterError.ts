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

  logger(
    `--------------------------------------------------------------------------------
| CoasterError                                                                 |
--------------------------------------------------------------------------------
${error.code}
  ${error.time}

${error.message}${details}
--------------------------------------------------------------------------------`
  );
}
