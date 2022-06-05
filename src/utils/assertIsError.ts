export function assertIsError(value: unknown): asserts value is Error {
  if (!(value instanceof Error)) {
    throw new Error(
      `Expected value to be an Error, got ${value} (type: ${typeof value})`
    );
  }
}
