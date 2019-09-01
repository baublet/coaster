export default function schemaInvalidError(errors: string[]) {
  return `Your schema is invalid

${errors.join("\n\n")}`;
}
