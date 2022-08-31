import path from "path";

export function resolveInputPathFromFile(
  pathToResolve: string,
  inputFileLocation: string
): string {
  const inputFilePath = path.basename(inputFileLocation).includes(".")
    ? path.dirname(inputFileLocation)
    : inputFileLocation;

  let result: string;
  if (pathToResolve.startsWith(".")) {
    result = path.resolve(inputFilePath, pathToResolve);
  } else if (pathToResolve.startsWith(path.sep)) {
    result = pathToResolve;
  } else if (pathToResolve.startsWith("~")) {
    result = path.resolve(pathToResolve);
  } else {
    result = path.resolve(inputFilePath, pathToResolve);
  }

  console.log({ pathToResolve, inputFileLocation, result });
  return result;
}
