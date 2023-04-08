import { Endpoint } from "@baublet/coaster";

export const endpoint: Endpoint = () => {
  return {
    endpoint: "/",
    method: "GET",
    handler: async (context) => {
      context.log("info", "Index page hit");
      context.response.send("Hello, world!");
    },
  };
};
