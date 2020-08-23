export function isEmptyObject(obj: any): boolean {
  if (typeof obj !== "object") return false;
  if (Object.keys(obj).length > 0) return false;
  return true;
}
