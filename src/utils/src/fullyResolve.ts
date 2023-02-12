/**
 * Fully resolves a type from something that isn't fully resolved. Note: your
 * fully resolved subject cannot be a function.
 *
 * @param resolvable The "to-resolve" subject
 * @returns The fully resolved resolvable subject
 */
export async function fullyResolve<T>(
  resolvable: unknown,
  ...optionalArgs: unknown[]
): Promise<T> {
  let resolvedValue: any = await resolvable;

  if (typeof resolvedValue === "function") {
    resolvedValue = await resolvedValue(...optionalArgs);
  }

  return resolvedValue;
}
