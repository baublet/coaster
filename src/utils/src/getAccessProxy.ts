interface ProxiedRecord<T extends (...args: any[]) => any> {
  [key: string]: any;
  (...args: Parameters<T>): ReturnType<T>;
}

/**
 * Returns an object proxy that allows a single access point to control what
 * the final return value of the chained call is.
 *
 * E.g.,
 *
 * @example
 * const test = getAccessProxy((path: string[]) => {
 *  console.log(path);
 * });
 *
 * test.foo.bar.baz(); // logs ["foo", "bar", "baz"]
 */
export function getAccessProxy<
  T extends (paths: string[], ...args: any[]) => any
>(handler: T): ProxiedRecord<T> {
  const paths: string[] = [];
  const proxy: any = new Proxy(handler, {
    get(target, prop) {
      paths.push(String(prop));
      return proxy;
    },
    apply(target, thisArg, args) {
      return handler(paths.splice(0, paths.length), ...args);
    },
  });
  return proxy;
}
