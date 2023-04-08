import { createNotFoundEndpoint } from "@baublet/coaster/endpoints";

export const notFound = createNotFoundEndpoint(async (context) => {
  context.response.status(404);
  context.response.send("Not found");
});
