import { EndPoint } from "@baublet/coaster";

const todoIndex: EndPoint = () => {
  return {
    endpoint: "/",
    handler: async (context) => {
      context.response.setData("Hello, world!");
    },
  };
};

export default todoIndex;
