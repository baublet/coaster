import { EndPoint } from "@baublet/coaster";

export const todoIndex: EndPoint = () => {
  return {
    endpoint: "/",
    handler: async (context) => {
      context.response.setData("Hello, world!");
    },
  };
};
