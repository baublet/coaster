import { ObjectWithStringLeafs } from "./pathsToResolverPaths";

interface ObjectWithTypeAsLeafs<T> {
  [key: string]: T | ObjectWithTypeAsLeafs<T>;
}

export function resolverPathsToResolvers<T>({
  resolverPaths,
  getResolver,
}: {
  resolverPaths: ObjectWithStringLeafs;
  getResolver: (path: string) => T;
}): ObjectWithTypeAsLeafs<T> {
  const resolvers: ObjectWithTypeAsLeafs<T> = {} as any;

  /**
   * We probably don't have to worry about stack overflows here, since GraphQL
   * schemas are are shallow.
   */
  function recurse(
    subjectNode: ObjectWithStringLeafs,
    targetNode: ObjectWithTypeAsLeafs<T> = resolvers
  ) {
    for (const prop of Object.keys(subjectNode)) {
      const currentNode = subjectNode[prop];
      if (typeof currentNode === "string") {
        targetNode[prop] = getResolver(currentNode);
      } else {
        const newTargetNode: ObjectWithTypeAsLeafs<T> = {};
        targetNode[prop] = newTargetNode;
        recurse(currentNode, newTargetNode);
      }
    }
  }

  recurse(resolverPaths);

  return resolvers;
}
