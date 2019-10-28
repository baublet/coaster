export default function migrationError(
  errorObject: Error,
  helpText: string = ""
): string {
  return `There was an error during a migration.${
    helpText ? " " + helpText : ""
  }\n\n${JSON.stringify(errorObject)}`;
}
