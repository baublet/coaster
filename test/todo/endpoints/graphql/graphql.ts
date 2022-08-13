import { LazyLoadedHandler } from "@baublet/coaster";

const graphqlHandler: LazyLoadedHandler = (context) => {
  context.response.setData("Users");
};

export default graphqlHandler;
