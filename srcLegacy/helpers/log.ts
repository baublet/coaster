import stringifyObject from "stringify-object";

export enum LogLevel {
  ERROR,
  DEBUG,
  WARN
}

const frameRegex = /.*\((.*)\)$/;
const cwd = process ? process.cwd() : "";

export default function log(...args: any[]): void {
  const stack = new Error().stack;

  const frameLine = stack.split("\n")[2];
  const frameFinder = frameRegex.exec(frameLine);

  let frame = "";
  if (frameFinder) {
    frame = frameFinder[1];
  }

  let logLevel = LogLevel.DEBUG;
  if (Object.keys(LogLevel).includes(args[0])) {
    logLevel = args[0] as LogLevel;
    args.splice(0, 1);
  }

  let logger = console.log;
  let loggerContext = console;

  switch (logLevel) {
    case LogLevel.ERROR:
      logger = console.error;
      break;
    case LogLevel.WARN:
      logger = console.warn;
      break;
  }

  logger
    .bind(loggerContext)
    .call(
      logger,
      ...[
        frame.replace(cwd, ""),
        "\n\n",
        ...args.map(arg =>
          typeof arg === "object" ? stringifyObject(arg) : arg
        )
      ]
    );
}
