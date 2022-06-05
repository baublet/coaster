/**
 * Given a list of arguments, turns them into an array of truthy values.
 *
 * @param args A list of arguments to collate truthy values of
 * @returns An array of all of the arguments, minus falsey values, in a flattened array
 */
export function collate<T>(
  ...args: (T | undefined | T[] | (T | undefined)[])[]
): T[] {
  const results: T[] = [];

  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const _arg of arg) {
        if (_arg) {
          results.push(_arg);
        }
      }
    } else {
      if (arg) {
        results.push(arg);
      }
    }
  }

  return results;
}
