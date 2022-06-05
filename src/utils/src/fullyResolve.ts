/**
 * Fully resolves a type from something that isn't fully resolved. Note: your
 * fully resolved subject cannot be a function.
 *
 * @param resolvable The "to-resolve" subject
 * @returns The fully resolved resolvable subject
 */
export async function fullyResolve<T>(resolvable: unknown): Promise<T> {
  let resolvedValue: any;

  for (let i = 256; i > 0; i--) {
    if (typeof resolvable === "function") {
      resolvedValue = resolvable();
    }

    if (resolvable instanceof Promise) {
      resolvedValue = resolvedValue(await resolvable);
    }
  }

  return resolvedValue;
}
