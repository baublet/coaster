import { EndpointInput } from "../endpoints/types";

export type CreateReactUiOptions = Partial<
  Pick<EndpointInput, "endpoint" | "middleware"> & {
    /**
     * The directory where your build files will be written. By default, Coaster
     * will build these files into a directory in `node_modules/.coaster`.
     */
    buildDir?: string;
    /**
     * When we serve this route's assets, if you want them served from a specific
     * subdirectory, you can specify it here. For example, if you want your assets
     * served from the root, use "/".
     *
     * Default: "assets"
     */
    assetsPath?: string;
    /**
     * Optional. If supplied, will generate an async routes component that you can
     * import into your frontend. This is useful for large, horizontally-split
     * front-end applications.
     *
     * Will turn this:
     * ```ts
     * createReactUi({
     *   routes: {
     *     $default: "pages/NotFound#NotFoundComponent",
     *     "/": "pages/Home",
     *     "/login": "pages/Login#default",
     *   }
     * });
     * ```
     *
     * ...into this:
     *
     * ```tsx
     * # ui/Routes.generated.tsx
     * import React from "react";
     * import { AsyncRoutes, route } from "@baublet/coaster-react";
     * import { BrowserRouter, Route } from "react-router-dom";
     *
     * export function Routes() {
     *   return (
     *     <AsyncRoutes
     *       RouterComponent={BrowserRouter}
     *       RouteComponent={Route}
     *       routes={[
     *         route({
     *           route: "/",
     *           loadFn: () => import("./pages/NotFound"),
     *           exportName: "NotFoundComponent",
     *         }),
     *         route({
     *           route: "/",
     *           loadFn: () => import("./pages/Home"),
     *           exportName: "Home",
     *           routeProps: {{ exact: true }}
     *         }),
     *         route({
     *           route: "/login",
     *           loadFn: () => import("./pages/Login"),
     *           exportName: "default",
     *           routeProps: {{ exact: true }}
     *         }),
     *       ]}
     *     />
     *    )
     *  }
     * ```
     */
    routes?: Record<string, string>;
    /**
     * Where to write the generated routes component.
     *
     * Default: "Routes.generated.tsx"
     */
    routesComponentPath?: string;
  }
>;
