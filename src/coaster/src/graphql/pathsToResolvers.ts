export async function pathsToResolvers({
  paths,
}: {
  paths: string[];
  resolversPath: string;
}): Promise<Record<string, any>> {
  const resolvers: Record<string, any> = {};

  for (const filePath of paths) {
    if (!filePath.includes(".ts")) {
      continue;
    }

    if (filePath.includes(".test.ts")) {
      continue;
    }

    const pathParts = filePath.split("/").filter(Boolean);

    const breadcrumbs: string[] = [];
    let node = resolvers;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];

      if (typeof node[part] === "string") {
        // TODO: return an error here. Invalid graphql structure (you can't have a "People" resolver _and_ field resolvers for "People")
        // Error could be like "Types with children cannot have a resolver."
      }

      breadcrumbs.push(part);
      if (!node[part]) {
        node[part] = {};
      }
      node = node[part];
    }

    node[pathParts[pathParts.length - 1]] = filePath;
  }

  return resolvers;
}
