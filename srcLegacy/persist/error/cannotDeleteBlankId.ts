export function cannotDeleteBlankId() {
  return new Error(
    `We tried to delete a model by ID, but passed in a blank string.`
  );
}
