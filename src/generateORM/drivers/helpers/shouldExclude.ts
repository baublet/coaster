import wcMatch from "wildcard-match";

export function shouldExclude(needles: string[], haystack: string): boolean {
  if (needles.length === 0) {
    return false;
  }
  return wcMatch(needles)(haystack);
}
