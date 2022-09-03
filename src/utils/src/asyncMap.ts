export function asyncMap<T, R>(
  subjects: T[],
  iterator: (subject: T) => Promise<R>
): Promise<R[]> {
  return Promise.all(subjects.map(iterator)) as any;
}
