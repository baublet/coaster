import React from "react";

/**
 * Allows your frontend to load components asynchronously, so we don't have to
 * load all components at once.
 *
 * @example
 * <AsyncComponent
 *   loadFn={() => import("./AnotherComponent")}
 *   exportName="AnotherComponent"
 *   componentProps={{ foo: "bar" }}
 * />
 */
export function AsyncComponent<
  TImportLoadFn extends () => Promise<{ [key: string]: any }>,
  TImport extends PromiseResolutionValue<ReturnType<TImportLoadFn>>,
  TImportKey extends keyof TImport,
  TProps extends TImport[TImportKey] extends (props: infer T) => any ? T : never
>({
  loadFn,
  loadingComponent = null,
  exportName,
  onError,
  componentProps,
}: {
  loadFn: TImportLoadFn;
  exportName: TImportKey;
  loadingComponent?: React.ReactElement<any, any> | null;
  onError?: (error: unknown) => void | React.ComponentType;
  componentProps?: TProps;
}): React.ReactElement<any, any> | null {
  const [, setRerenderSeed] = React.useState<number>(0);
  const rerender = React.useCallback(() => {
    setRerenderSeed((seed) => seed + 1);
  }, [setRerenderSeed]);

  const componentRef = React.useRef<React.ComponentType | null>(null);

  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    loadFn()
      .then((components) => {
        if (!mounted.current) {
          return;
        }
        componentRef.current = components[String(exportName)];
        rerender();
      })
      .catch((error) => {
        if (!mounted.current) {
          return;
        }
        if (onError) {
          const component = onError?.(error);
          if (component) {
            componentRef.current = component;
            rerender();
          }
          return;
        }
      });
  }, []);

  if (componentRef.current) {
    const AsyncComponent = componentRef.current;
    return <AsyncComponent {...Object(componentProps || {})} />;
  }

  return loadingComponent;
}

type PromiseResolutionValue<V> = V extends PromiseLike<infer U> ? U : never;
