export function cannotFindByBlankId() {
  return new Error(
    `We tried to find a model by ID, but passed in a blank string.`
  );
}
