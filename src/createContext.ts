type ContextKey = string | number;

type NiceType<T> = {} & T;

export type RequestContext = Record<string, any>;

export type ContextNode<R extends RequestContext> =
  | FactoryContextNode<R>
  | SingletonContextNode;

export type FactoryContextNode<R extends RequestContext> = {
  type: "factory";
  factory: (requestContext?: R) => Promise<any> | any;
};
export function isFactoryContextNode(
  node: ContextNode<any>
): node is FactoryContextNode<any> {
  return node.type === "factory";
}

export type SingletonContextNode = { type: "singleton"; value: any };
export function isSingletonContextNode(
  node: ContextNode<any>
): node is SingletonContextNode {
  return node.type === "singleton";
}

type ComputedContext<
  R extends RequestContext,
  T extends Record<ContextKey, ContextNode<R>>
> = NiceType<
  {
    [K in keyof T]: T[K] extends FactoryContextNode<R>
      ? ReturnType<T[K]["factory"]>
      : T[K] extends SingletonContextNode
      ? T[K]["value"]
      : never;
  }
>;

interface CreateContextArguments<
  T extends Record<ContextKey, ContextNode<R>>,
  R extends RequestContext
> {
  nodes: T;
  requestContext: R;
}

export function createContext<
  T extends Record<ContextKey, ContextNode<R>>,
  R extends RequestContext
>({
  nodes,
  requestContext,
}: CreateContextArguments<T, R>): ComputedContext<R, T> {
  const factoryValues: Record<ContextKey, any> = {};
  const contextObject: T = nodes;

  return new Proxy(contextObject, {
    get: (_, prop: string | number) => {
      const node: ContextNode<any> = contextObject[prop];
      if (isFactoryContextNode(node)) {
        if (!factoryValues[prop]) {
          factoryValues[prop] = node.factory(requestContext);
        }
        return factoryValues[prop];
      }
      if (isSingletonContextNode(node)) {
        return node.value;
      }
      // For safety in non-TS codebases
      // @ts-expect-error
      throw new Error(`Unknown context node type: ${node.type}`);
    },
  }) as ComputedContext<R, T>;
}

async () => {
  const context = createContext({
    requestContext: {
      test: "123",
    },
    nodes: {
      dbConnection: {
        type: "singleton",
        value: { db: "connection" },
      },
      entityFactory: {
        type: "factory",
        factory: () => "1",
      },
    },
  });

  context.dbConnection;
  context.entityFactory;
};
