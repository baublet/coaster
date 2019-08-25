export default function idNameFromName(
  name: string,
  plural: boolean = false
): string {
  const identifier = `_id${plural ? "s" : ""}`;
  if (name.includes(identifier)) return name;
  return `${name}${identifier}`;
}
