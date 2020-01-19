export default function reloadInvariantViolation(
  modelName: string,
  id: string | number
): Error {
  return new Error(
    `Reload invariant violation when trying to reload model ${modelName} with ID ${id}. It was likely deleted in another part of your application.`
  );
}
