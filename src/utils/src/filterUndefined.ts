export function filterUndefined<THaystack, TNeedle = undefined>(
  haystack: THaystack[],
  needle?: TNeedle
): Exclude<THaystack, TNeedle>[] {
  return (haystack as any).filter((straw: unknown) => straw !== needle);
}
