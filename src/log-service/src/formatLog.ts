import stringify from "safe-json-stringify";
import colors from "@colors/colors";

export function formatLog(...args: any[]): string {
  const datePieces = colors.dim(new Date().toISOString() + " | ");
  const stringifiedArgs = stringifyArgumentsForLogging(...args);

  return stringifiedArgs
    .split("\n")
    .map((line) => `${datePieces}${line.trimEnd()}`)
    .join("\n");
}

function stringifyArgumentsForLogging(...args: any[]): string {
  if (args.length === 1) {
    const firstArg = args[0];
    if (typeof firstArg === "string") {
      return firstArg;
    }
    return stringify(firstArg);
  }

  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      return stringify(arg);
    })
    .join(" ");
}
