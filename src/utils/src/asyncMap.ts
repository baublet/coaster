export async function asyncMap<T, R>(
  subjects: T[],
  iterator: (subject: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (const subject of subjects) {
    results.push(await iterator(subject));
  }

  return results;
}
