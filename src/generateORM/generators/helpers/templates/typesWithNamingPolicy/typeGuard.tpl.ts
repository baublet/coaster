export function $$typeGuardFunctionName(
  subject: any
): subject is $$prefixedEntityName {
  if (typeof subject === "object") {
    if (objectHasProperties(subject, $$columnNamesAsJsonString)) {
      return true;
    }
  }
  return false;
}
