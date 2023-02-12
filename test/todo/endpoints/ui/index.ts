import { Endpoint } from "@baublet/coaster";
import { createReactTrack } from "@baublet/coaster/react";

export const endpoint: Endpoint = createReactTrack({
  endpoint: "*",
  staticAssetsPath: "./assets",
  staticAssetsPublicUrl: "/assets",
  cssPublicPath: "/assets/js",
  jsPublicPath: "/assets/css",
  rootComponent: "./App.tsx",
});
