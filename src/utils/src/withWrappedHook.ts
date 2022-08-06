export async function withWrappedHook<
  TFunction extends (args: TArgs) => Promise<TArgs>,
  TArgs
>(maybeFunction: TFunction | undefined, args: TArgs): Promise<TArgs> {
  if (!maybeFunction) {
    return args;
  }

  return await maybeFunction(args);
}
