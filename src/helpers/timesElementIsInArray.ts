function defaultComparator(element: any, array: any[]) {
  let times = 0;
  for (let i = 0; i < array.length; i++) {
    if (element === array[i]) {
      times++;
    }
  }
  return times;
}

export default function timesElementIsInArray(
  element: any,
  array: any[],
  comparator: (element: any, array: any[]) => number = defaultComparator
): number {
  return comparator(element, array);
}
