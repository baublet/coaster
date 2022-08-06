/**
 * By default, TS forces your `.includes` method on an array to constrain
 * the `.includes` type to be a subset of the parent array. But in some
 * cases, you need to check if the array contains a value that may be in
 * a less constrained type (e.g., a string instead of a string literal).
 *
 * This function is a workaround for that.
 */
export function arrayIncludes<
  TSubject extends any[] | readonly any[],
  TValue = any
>(array: TSubject, value: TValue): value is TSubject[number] {
  return array.indexOf(value) !== -1;
}
