/**
 * Given a "hook" function (e.g., a function that takes data and returns that
 * same data, either a copy or the original). That function might be undefined.
 * If that function is defined, this function will pass the second argument of
 * this function through the hook function to be modified or duplicated,
 * returning the result.
 *
 * If the function is undefined, this function returns the original arguments.
 */
export async function withWrappedHook<
  TFunction extends (args: TArgs) => Promise<TArgs>,
  TArgs
>(maybeFunction: TFunction | undefined, args: TArgs): Promise<TArgs> {
  if (!maybeFunction) {
    return args;
  }

  return await maybeFunction(args);
}
