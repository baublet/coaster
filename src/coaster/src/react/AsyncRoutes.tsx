import React from "react";

import { AsyncComponent } from "./AsyncComponent";

/**
 *
 */
export function AsyncRoutes<
  TRouterComponent extends React.ComponentType<any>,
  TRouteComponent extends React.ComponentType<{
    path?: string;
    component?: any;
  }>
>({
  routes,
  RouteComponent,
  routeComponentProps,
  RouterComponent,
  routerComponentProps,
}: {
  routes: AsyncRouteDefinition[];
  RouterComponent: TRouterComponent;
  routerComponentProps?: React.ComponentProps<TRouterComponent>;
  RouteComponent: TRouteComponent;
  routeComponentProps?: Omit<
    React.ComponentProps<TRouteComponent>,
    "path" | "element"
  >;
}): React.ReactElement<any, any> | null {
  return (
    <RouterComponent {...(routerComponentProps as any)}>
      {routes.map(
        (route) =>
          (
            <RouteComponent
              key={route.key || route.route}
              path={route.route}
              component={
                <AsyncComponent
                  loadFn={route.loadFn}
                  exportName={route.exportName || "default"}
                  componentProps={route.componentProps}
                />
              }
              {...(routeComponentProps as any)}
            />
          ) as any
      )}
    </RouterComponent>
  );
}

export function route<
  TImportLoadFn extends () => Promise<{ [key: string]: any }>,
  TImport extends PromiseResolutionValue<ReturnType<TImportLoadFn>>,
  TImportKey extends keyof TImport,
  TProps extends TImport[TImportKey] extends (props: infer T) => any ? T : never
>({
  exportName,
  loadFn,
  route,
  componentProps,
}: {
  route: string;
  loadFn: TImportLoadFn;
  exportName?: TImportKey;
  componentProps?: TProps;
}): AsyncRouteDefinition {
  return {
    route,
    loadFn,
    exportName: String(exportName),
    componentProps: componentProps || {},
  };
}

interface AsyncRouteDefinition {
  route: string;
  // For mapping React components. If not provided, this will be inferred from the route.
  // You might need to change this if you have multiple components for the same route.
  key?: string;
  loadFn: () => Promise<Record<string, any>>;
  exportName?: string;
  componentProps?: Record<string, any>;
}

type PromiseResolutionValue<V> = V extends PromiseLike<infer U> ? U : never;
