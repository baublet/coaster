import { NotFoundEndpoint } from "@baublet/coaster";

const notFound: NotFoundEndpoint = {
  handler: async (context) => {
    console.log("DID THIS GET CALLED?");
    context.response.setStatus(404);
    context.response.setData("Not found");
  },
};

export default notFound;
