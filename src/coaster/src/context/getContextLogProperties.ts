import { log } from "@baublet/coaster-log-service";

import { Context } from "./base";

/**
 * Logging is core functionality that needs to be shared by any plugins
 * and other things outside of userspace, yet necessarily configurable by
 * developers. We thus have to expose the logging service from the context
 * for ease of access.
 */
export function getContextLogProperties(): Pick<Context, "log"> {
  return {
    log: (level, ...details) => {
      log[level](...details);
    },
  };
}
