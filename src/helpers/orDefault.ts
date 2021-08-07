export function orDefault<T extends any>(
  vars: (T | null | undefined)[],
  defaultValue: Exclude<T, undefined | null>
): Exclude<T, undefined | null> {
  for (const subject of vars) {
    if (subject) {
      return subject as Exclude<T, undefined | null>;
    }
  }
  return defaultValue;
}
