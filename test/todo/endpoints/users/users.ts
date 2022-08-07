import { LazyLoadedHandler } from "@baublet/coaster";

const users: LazyLoadedHandler = (context) => {
  context.response.setData("Users");
  context.log("debug", "Made it here!");
};

export default users;
