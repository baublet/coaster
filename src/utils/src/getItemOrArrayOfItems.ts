export type ItemOrArrayOfItems<T> = T | T[];

export function getItemOrArrayOfItems<T>(
  itemOrArrayOfItems: ItemOrArrayOfItems<T>
): T[] {
  if (Array.isArray(itemOrArrayOfItems)) {
    return itemOrArrayOfItems;
  }
  return [itemOrArrayOfItems];
}
