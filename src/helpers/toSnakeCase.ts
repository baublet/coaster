export default function toSnakeCase(str: string): string {
  let s;
  s = str.replace(/[^\w\s]/g, "");
  s = s.replace(/\s+/g, " ");
  return s
    .toLowerCase()
    .split(" ")
    .join("_");
}
