export function isInvokable(
  maybeFn: unknown
): maybeFn is (...args: any[]) => any {
  const type = typeof maybeFn;
  const maybeAsAny: any = maybeFn;

  if (type === "function") {
    return true;
  }
  if (type !== "object") {
    return false;
  }
  if (typeof maybeAsAny?.["bind"] === "function") {
    return true;
  }
  return false;
}
