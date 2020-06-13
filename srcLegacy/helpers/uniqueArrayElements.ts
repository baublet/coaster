export function defaultComparison(a1: any, a2: any): boolean {
  return a1 === a2;
}

/**
 * Takes an array and an optional comparison function. Returns a new array of
 * the unique elements on the original array.
 * @param array
 * @param comparison
 */
export default function uniqueArrayElements(
  array: any[],
  comparison: (a1: any, a2: any) => boolean = defaultComparison
): any[] {
  const uniqueElements = [];
  array.forEach(a1 => {
    let addIt = true;
    uniqueElements.forEach(a2 => {
      if (!addIt) {
        return;
      }
      if (comparison(a1, a2)) {
        addIt = false;
      }
    });
    if (addIt) {
      uniqueElements.push(a1);
    }
  });
  return uniqueElements;
}
