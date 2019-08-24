export enum LogLevel {
  ERROR,
  DEBUG,
  WARN
}

export default function log(...args: any[]): void {
  let logLevel = LogLevel.DEBUG;
  if (Object.keys(LogLevel).includes(args[0])) {
    logLevel = args[0] as LogLevel;
    args.splice(0, 1);
  }

  let logger = console.log;

  switch (logLevel) {
    case LogLevel.ERROR:
      logger = console.error;
      break;
    case LogLevel.WARN:
      logger = console.warn;
      break;
  }

  args.forEach(arg => {
    logger(arg);
  });
}
