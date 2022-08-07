import { Endpoint } from "@baublet/coaster";

const todoIndex: Endpoint = () => {
  return {
    endpoint: "/",
    handler: async (context) => {
      context.response.setData("Hello, world!");
    },
  };
};

export default todoIndex;
