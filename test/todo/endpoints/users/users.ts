import { LazyLoadedHandler } from "@baublet/coaster";

export const handler: LazyLoadedHandler = (context) => {
  context.response.setData("Users");
};
