export async function asyncForEach<T>(
  subjects: T[],
  iterator: (subject: T) => Promise<any>
): Promise<void> {
  await Promise.all(subjects.map(iterator));
}
