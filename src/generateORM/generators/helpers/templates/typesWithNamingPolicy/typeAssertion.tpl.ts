export function $$assertionFunctionName(
  subject: any
): asserts subject is $$prefixedEntityName {
  if (typeof subject === "object") {
    if (objectHasProperties(subject, $$columnNamesAsJsonString)) {
      return;
    }
  }
  throw new Error(
    "Invariance violation! Expected subject to be a $$prefixedEntityName, but it was instead: " +
      JSON.stringify(subject)
  );
}
