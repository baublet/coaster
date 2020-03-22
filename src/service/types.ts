import {
  GraphQLServiceArguments,
  GraphQLServiceOptions
} from "./graphql/types";
import { RESTServiceArguments, RESTServiceOptions } from "./rest/types";

export interface Service {
  name: string;
  host: string;
  port: number;
  protocol: string;
  initialize: () => Promise<void>;
  start: () => Promise<void>;
}

export enum ServiceType {
  GRAPHQL,
  REST,
  WEB
}

export type ServiceArguments = GraphQLServiceArguments | RESTServiceArguments;

export interface ServiceDefaultProperties {
  name: string;
  host?: string;
  port: number;
  type: ServiceType;
  options: GraphQLServiceOptions | RESTServiceOptions;
}

// Type tests

export const gqlService: ServiceArguments = {
  name: "GraphQL Service",
  port: 80,
  type: ServiceType.GRAPHQL,
  options: {
    resolvers: {}
  }
};

export const restService: ServiceArguments = {
  name: "REST Service",
  port: 80,
  type: ServiceType.REST,
  options: {
    routes: {}
  }
};
