import { Endpoint } from "@baublet/coaster";

export const endpoint: Endpoint = () => {
  return {
    endpoint: "/",
    method: "get",
    handler: async (context) => {
      context.log("info", "Index page hit");
      context.response.setData("Hello, world!");
    },
  };
};
