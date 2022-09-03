import { createNotFoundEndpoint } from "@baublet/coaster";

export const notFound = createNotFoundEndpoint(async (context) => {
  context.response.setStatus(404);
  context.response.setData("Not found");
});
