export function getErrorLikeStringFromUnknown(error: unknown): string {
  if (typeof error !== "object") {
    return String(error);
  }
  if (error === null) {
    return "null";
  }
  if (error instanceof Error) {
    return `${error.message}\n\n${error.stack}`;
  }
  return JSON.stringify(error);
}
