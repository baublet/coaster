export function isPromise(obj: any): boolean {
  if (typeof obj !== "object") return false;
  if (!("then" in obj)) return false;
  return typeof obj.then === "function";
}
