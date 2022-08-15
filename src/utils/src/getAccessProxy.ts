interface ProxiedRecord<T extends (...args: any[]) => any> {
  [key: string]: any;
  (...args: Parameters<T>): ReturnType<T>;
}

/**
 * Returns an object proxy that allows a single access point to control what
 * the ultimate return is.
 *
 * E.g.,
 *
 * @example
 * const test = getAccessProxy((path: string[]) => {
 *  console.log(path);
 * });
 *
 * test.foo.bar.baz; // logs ["foo", "bar", "baz"]
 */
let proxiesCreated = 0;
export function getAccessProxy<
  T extends (paths: string[], ...args: any[]) => any
>(
  handler: T,
  paths: string[] = [],
  proxyCacheMap: Map<string, any> = new Map()
): ProxiedRecord<T> {
  proxiesCreated++;
  function getProxyForPath(handler: T, paths: string[]) {
    const path = paths.join(".");
    if (proxyCacheMap.has(path)) {
      return proxyCacheMap.get(path);
    }

    const proxy = getAccessProxy(handler, paths, proxyCacheMap);
    proxyCacheMap.set(path, proxy);
    return proxy;
  }

  const proxy = new Proxy(handler, {
    get(target, prop) {
      return getProxyForPath(handler, [...paths, String(prop)]);
    },
    apply(target, thisArg, args) {
      return handler(paths, ...args);
    },
  });
  return proxy;
}

export function _getProxiesCreated() {
  return proxiesCreated;
}

export function _resetProxiesCreated() {
  proxiesCreated = 0;
}
