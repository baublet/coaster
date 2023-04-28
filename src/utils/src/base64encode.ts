const _btoa: any = btoa;

export function base64encode(str: string): string {
  if (typeof _btoa === "function") {
    return _btoa(str);
  }
  return Buffer.from(str).toString("base64");
}
