import path from "path";

export interface ObjectWithStringLeafs {
  [key: string]: string | ObjectWithStringLeafs;
}

export function pathsToResolverPaths({
  paths,
  resolversPath,
  ignorePatterns,
}: {
  paths: string[];
  resolversPath: string;
  ignorePatterns: RegExp[];
}): ObjectWithStringLeafs {
  const resolvers: ObjectWithStringLeafs = {};

  for (const filePath of paths) {
    for (const ignorePattern of ignorePatterns) {
      if (ignorePattern.test(filePath)) {
        continue;
      }
    }

    const pathParts = filePath
      .replace(resolversPath, "")
      .split("/")
      .filter(Boolean);

    let node = resolvers;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];

      if (typeof node[part] !== "object") {
        node[part] = {};
      }
      node = node[part] as ObjectWithStringLeafs;
    }

    const terminalPathPart = pathParts[pathParts.length - 1];
    const terminalPathPartWithoutExtension = path.parse(terminalPathPart).name;
    node[terminalPathPartWithoutExtension] = filePath;
  }

  return resolvers;
}
