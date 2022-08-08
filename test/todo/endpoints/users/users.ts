import { LazyLoadedHandler } from "@baublet/coaster";

const users: LazyLoadedHandler = (context) => {
  context.response.setData("Users");
};

export default users;
