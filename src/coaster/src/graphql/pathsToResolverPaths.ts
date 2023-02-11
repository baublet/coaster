import path from "path";

export interface ObjectWithStringLeafs {
  [key: string]: string | ObjectWithStringLeafs;
}

export async function pathsToResolverPaths({
  paths,
  resolversPath,
  ignorePatterns,
}: {
  paths: string[];
  resolversPath: string;
  ignorePatterns: RegExp[];
}): Promise<ObjectWithStringLeafs> {
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
      const nodePart = node[part];

      if (typeof nodePart === "string") {
        // TODO: return an error here. Invalid graphql structure (you can't have a "People" resolver _and_ field resolvers for "People")
        // Error could be like "Types with children cannot have a resolver."
        continue;
      }

      if (!node[part]) {
        node[part] = {};
      }
      node = nodePart;
    }

    const terminalPathPart = pathParts[pathParts.length - 1];
    const terminalPathPartWithoutExtension = path.parse(terminalPathPart).name;
    node[terminalPathPartWithoutExtension] = filePath;
  }

  return resolvers;
}
