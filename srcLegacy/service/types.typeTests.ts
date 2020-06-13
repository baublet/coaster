import { ServiceArguments, ServiceType } from "./types";

// export const gqlService: ServiceArguments = {
//   name: "GraphQL Service",
//   port: 80,
//   type: ServiceType.GRAPHQL,
//   options: {
//     resolvers: {}
//   }
// };

export const restService: ServiceArguments = {
  name: "REST Service",
  port: 80,
  type: ServiceType.REST,
  options: {
    routes: {}
  }
};
