export function safeToLowerCase<T>(
  maybeString: T
): T extends string ? Lowercase<T> : T {
  if (typeof maybeString !== "string") {
    return maybeString as any;
  }
  return maybeString.toLowerCase() as any;
}
