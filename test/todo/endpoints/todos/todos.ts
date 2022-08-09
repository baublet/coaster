import { LazyLoadedHandler } from "@baublet/coaster";

const todo: LazyLoadedHandler = (context) => {
  context.response.setData("Todos");
};

export default todo;
