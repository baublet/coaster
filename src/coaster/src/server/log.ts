import colors from "@colors/colors";
/**
 * Loggers appropriate for server internals
 */
function info(...args: any[]) {
  console.log(colors.dim(new Date().toISOString()), ...args);
}

function error(...args: any[]) {
  console.error(colors.dim(new Date().toISOString()), ...args);
}

function debug(...args: any[]) {
  console.debug(colors.dim(new Date().toISOString()), ...args);
}

export const log = {
  info,
  error,
  debug,
};
