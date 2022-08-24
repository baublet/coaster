import { Endpoint } from "@baublet/coaster";

export const endpoint: Endpoint = () => {
  return {
    endpoint: "/",
    method: "get",
    fruit: "loops",
    handler: async (context) => {
      context.response.setData("Hello, world!");
    },
  };
};
