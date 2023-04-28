const _atob: any = atob;

export function base64decode(str: string, encoding: "utf-8" = "utf-8"): string {
  if (typeof _atob === "function") {
    return _atob(str);
  }
  return Buffer.from(str, "base64").toString(encoding);
}
